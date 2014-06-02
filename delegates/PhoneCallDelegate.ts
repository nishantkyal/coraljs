///<reference path='../_references.d.ts'/>
import _                                                                = require('underscore');
import q                                                                = require('q');
import moment                                                           = require('moment');
import Utils                                                            = require('../common/Utils');
import Config                                                           = require('../common/Config');
import PhoneCallDao                                                     = require('../dao/PhoneCallDao');
import BaseDaoDelegate                                                  = require('../delegates/BaseDaoDelegate');
import IntegrationMemberDelegate                                        = require('../delegates/IntegrationMemberDelegate');
import UserPhoneDelegate                                                = require('../delegates/UserPhoneDelegate');
import UserDelegate                                                     = require('../delegates/UserDelegate');
import NotificationDelegate                                             = require('../delegates/NotificationDelegate');
import TransactionDelegate                                              = require('../delegates/TransactionDelegate');
import CallStatus                                                       = require('../enums/CallStatus');
import IncludeFlag                                                      = require('../enums/IncludeFlag');
import PhoneType                                                        = require('../enums/PhoneType');
import ScheduledTaskType                                                = require('../enums/ScheduledTaskType');
import PhoneCall                                                        = require('../models/PhoneCall');
import User                                                             = require('../models/User');
import UserPhone                                                        = require('../models/UserPhone');
import IntegrationMember                                                = require('../models/IntegrationMember');
import AbstractScheduledTask                                            = require('../models/tasks/AbstractScheduledTask');
import TriggerPhoneCallTask                                             = require('../models/tasks/TriggerPhoneCallTask');
import CallReminderNotificationScheduledTask                            = require('../models/tasks/CallReminderNotificationScheduledTask');
import UnscheduledCallsCache                                            = require('../caches/UnscheduledCallsCache');
import PhoneCallCache                                                   = require('../caches/PhoneCallCache');
import CallProviderFactory                                              = require('../factories/CallProviderFactory');

class PhoneCallDelegate extends BaseDaoDelegate
{
    static ALLOWED_NEXT_STATUS:{ [s: number]: CallStatus[]; } = {};

    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private transactionDelegate = new TransactionDelegate();
    private callProvider = new CallProviderFactory().getProvider();
    private phoneCallCache = new PhoneCallCache();

    private static ctor = (() =>
    {
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.PLANNING] = [CallStatus.SCHEDULING, CallStatus.CANCELLED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.SCHEDULING] = [CallStatus.SCHEDULED, CallStatus.CANCELLED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.SCHEDULED] = [CallStatus.CANCELLED, CallStatus.POSTPONED, CallStatus.IN_PROGRESS];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.CANCELLED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.COMPLETED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.IN_PROGRESS] = [CallStatus.IN_PROGRESS, CallStatus.COMPLETED, CallStatus.FAILED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.FAILED] = [CallStatus.SCHEDULING];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.POSTPONED] = [CallStatus.SCHEDULING, CallStatus.CANCELLED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.AGENDA_DECLINED] = [CallStatus.SCHEDULING];
    })();

    get(id:any, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        var superGet = super.get;
        var self = this;

        return this.phoneCallCache.get(id)
            .then(
            function callFetched(result):any
            {
                if (!Utils.isNullOrEmpty(result))
                    return new PhoneCall(result);
                else
                    return superGet.call(self, id, fields, includes, transaction);
            },
            function callFetchError()
            {
                return superGet(id, fields, includes);
            });
    }

    update(criteria:Object, newValues:Object, transaction?:Object):q.Promise<any>;
    update(criteria:number, newValues:Object, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:Object, transaction?:Object):q.Promise<any>
    {
        var newStatus = newValues.hasOwnProperty(PhoneCall.STATUS) ? newValues[PhoneCall.STATUS] : null;

        if (!Utils.isNullOrEmpty(newStatus))
        {
            if (Utils.getObjectType(criteria) == 'Number')
                criteria = {id: criteria};

            // Only return calls whose current status' next step can be the new status
            // This is a better way to update status to a valid next status without querying for current status first
            var allowedPreviousStatuses = _.filter(_.keys(PhoneCallDelegate.ALLOWED_NEXT_STATUS), function (status:any)
            {
                return _.contains(PhoneCallDelegate.ALLOWED_NEXT_STATUS[status], newStatus);
            });

            if (allowedPreviousStatuses.length > 0)
                criteria[PhoneCall.STATUS] = _.map(allowedPreviousStatuses, function (status:string) {return parseInt(status); });
            ;
        }

        return super.update(criteria, newValues, transaction);
    }

    getIncludeHandler(include:IncludeFlag, result:PhoneCall):q.Promise<any>
    {
        var self = this;
        switch (include)
        {
            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER:
                return self.integrationMemberDelegate.get(result.getIntegrationMemberId(), IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]);
            case IncludeFlag.INCLUDE_USER:
                return self.userDelegate.get(result.getCallerUserId());
            case IncludeFlag.INCLUDE_EXPERT_PHONE:
                return self.userPhoneDelegate.get(result.getExpertPhoneId());
            case IncludeFlag.INCLUDE_USER_PHONE:
                return self.userPhoneDelegate.get(result.getCallerPhoneId());
        }
        return super.getIncludeHandler(include, result);
    }

    /* Trigger the call */
    triggerCall(callId:number):q.Promise<any>
    {
        var self = this;
        return self.get(callId, null, [IncludeFlag.INCLUDE_USER_PHONE])
            .then(
            function callFetched(call:PhoneCall)
            {
                return self.callProvider.makeCall(call.getUserPhone().getCompleteNumber(), callId, call.getNumReattempts());
            })
            .then(
            function callTriggered()
            {
                var call:PhoneCall = new PhoneCall();
                call.setStatus(CallStatus.IN_PROGRESS);

                return self.update(callId, call);
            })
            .fail(
            function callFailed(error)
            {
                //TODO[ankit] - if call trigger fails then also we shoudl retry
                self.logger.error("Error in call triggering, error: %s", JSON.stringify(error));
            });
    }

    /* Queue the call for triggering */
    queueCallForTriggering(call:number);
    queueCallForTriggering(call:PhoneCall);
    queueCallForTriggering(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.get(call, null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_EXPERT_PHONE, IncludeFlag.INCLUDE_USER_PHONE])
                .then(function (fetchedCall:PhoneCall)
                {
                    self.queueCallForTriggering(fetchedCall);
                });

        // Queue call for triggering if it's before the scheduler will trigger again
        var startTime:number = (call.getStartTime() + (call.getDelay() || 0) * 1000);
        var error:string = '';

        if ((call.getNumReattempts() || 0) <= Config.get(Config.MAXIMUM_REATTEMPTS)) //check numbe rof reattempts already made
        {
            if (call.getStatus() == CallStatus.IN_PROGRESS || call.getStatus() == CallStatus.SCHEDULED) // check status of call is valid or not
            {
                if (startTime > moment().valueOf() && startTime < (moment().valueOf() + Config.get(Config.PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS) * 1000)) // check whether call is within next hour or not
                {
                    var ScheduledTaskDelegate = require('../delegates/ScheduledTaskDelegate');
                    var scheduledTaskDelegate = new ScheduledTaskDelegate();

                    //check whether the call has not been scheduled manually (like on Server restart)
                    var callsAlreadyScheduledTasks:AbstractScheduledTask[] = scheduledTaskDelegate.filter(ScheduledTaskType.CALL);
                    var alreadyScheduled = _.find(callsAlreadyScheduledTasks, function (callScheduledTask:any)
                    {
                        var callTask:TriggerPhoneCallTask = callScheduledTask;
                        return callTask.getCallId() == call.getId()
                    });

                    if (Utils.isNullOrEmpty(alreadyScheduled))
                    {
                        scheduledTaskDelegate.scheduleAt(new TriggerPhoneCallTask(call.getId()), startTime);
                        if((call.getDelay() || 0) == 0) //send reminder only once
                            scheduledTaskDelegate.scheduleAt(new CallReminderNotificationScheduledTask(call.getId()), call.getStartTime() - parseInt(Config.get(Config.CALL_REMINDER_LEAD_TIME_SECS)) * 1000);
                        return self.phoneCallCache.addCall(call, null, true);
                    }
                    else
                        error = 'Call already scheduled';
                }
                else
                    error = 'Scheduled for much later'
            }
            else
                error = 'Call status not correct for queueing'
        }
        else
            error = 'Call has been tried maximum allowed times';

        self.logger.debug('Queueing trigger failed for call id: %s, reason: %s', call.getId(), error);
        return q.resolve(true);
    }

    /* Cancel call */
    cancelCall(call:number, cancelledByUser:number):q.Promise<any>;
    cancelCall(call:PhoneCall, cancelledByUser:number):q.Promise<any>;
    cancelCall(call:any, cancelledByUser:number):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.get(call)
                .then(
                function callFetched(call:PhoneCall)
                {
                    return self.cancelCall(call, cancelledByUser);
                });

        // 1. Update status
        // 2. Remove from cache
        // 3. If cancelled by user, create a call cancellation transaction in his account
        // 4. Cancel trigger task

        var tasks = [
            self.update(call.getId(), Utils.createSimpleObject(PhoneCall.STATUS, CallStatus.CANCELLED)),
            self.phoneCallCache.delete(call.getId()),
        ];

        if (cancelledByUser == call.getCallerUserId())
        {
            tasks.push(self.transactionDelegate.createCancellationTransaction(call.getId(), cancelledByUser));
        }

        return q.all(tasks)
            .then(
            function callCancelled()
            {
                var ScheduledTaskDelegate = require('../delegates/ScheduledTaskDelegate');
                var scheduledTaskDelegate = new ScheduledTaskDelegate();

                var callTriggeringScheduledTaskId = scheduledTaskDelegate.find(null);
                if (!Utils.isNullOrEmpty(callTriggeringScheduledTaskId))
                    return scheduledTaskDelegate.cancel(callTriggeringScheduledTaskId);
                else
                    return q.resolve(true);
            });
    }

    /**
     * Process call scheduling based on expert/caller input
     * Called when either caller/expert respond the time slots suggested by other party
     * The call may get
     *  - Cancelled (if either party cancels)
     *  - Scheduled (if either party agrees to one of suggested)
     *  - Remain unchanged (if suggested slots are rejected and alternates suggested)
     * */
    processSchedulingRequest(callId:number, requesterUserId:number, originalSlots:number[], pickedSlots:number[], reason?:string):q.Promise<CallStatus>
    {
        var notificationDelegate = new NotificationDelegate();
        var self = this;

        return this.get(callId, null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_INTEGRATION_MEMBER])
            .then(
            function callFetched(call:PhoneCall)
            {
                var isConfirmation = pickedSlots.length == 1 && _.contains(originalSlots, pickedSlots[0]);
                var isSuggestion = _.intersection(originalSlots, pickedSlots).length == 0;
                var isRejection = !Utils.isNullOrEmpty(reason);

                if (isRejection)
                {
                    // Cancel call and notify
                    return self.cancelCall(callId, requesterUserId)
                        .then(
                        function callCancelled()
                        {
                            return notificationDelegate.sendCallRejectedNotifications(call, reason);
                        })
                        .then(
                        function sendResponse() { return CallStatus.CANCELLED; });
                }
                else if (isConfirmation)
                {
                    if (Utils.isNullOrEmpty(call.getCallerPhoneId()) || Utils.isNullOrEmpty(call.getExpertPhoneId()))
                        return q.reject("Can't schedule the call because of missing phone number");

                    // 1. Update call status
                    // 2. Send notifications to both
                    // 3. Try to queue call for triggering
                    return self.update(callId, {status: CallStatus.SCHEDULED, start_time: pickedSlots[0]})
                        .then(
                        function callStatusUpdated()
                        {
                            return q.all([
                                self.queueCallForTriggering(call),
                                notificationDelegate.sendCallSchedulingCompleteNotifications(call, pickedSlots[0])
                            ]);
                        })
                        .then(
                        function sendResponse() { return CallStatus.SCHEDULED; })
                }
                else if (isSuggestion && call.getStatus() == CallStatus.SCHEDULING)
                {
                    // Send notification to other party
                    var isExpert = call.getIntegrationMember().getUser().getId() == requesterUserId;
                    var isCaller = call.getCallerUserId() == requesterUserId;

                    if (isCaller)
                        return notificationDelegate.sendNewTimeSlotsToExpert(call, pickedSlots, requesterUserId)
                            .then(
                            function sendResponse() { return CallStatus.SCHEDULING; });
                    else if (isExpert)
                        return notificationDelegate.sendSuggestedAppointmentToCaller(call, pickedSlots[0], requesterUserId)
                            .then(
                            function sendResponse() { return CallStatus.SCHEDULING; });
                }
                else
                    throw('Invalid request');
            });
    }

    constructor() { super(new PhoneCallDao()); }
}
export = PhoneCallDelegate
