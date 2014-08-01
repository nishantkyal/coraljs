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
import TransactionLineDelegate                                          = require('../delegates/TransactionLineDelegate');
import ScheduleExceptionDelegate                                        = require('../delegates/ScheduleExceptionDelegate');
import CallStatus                                                       = require('../enums/CallStatus');
import PhoneType                                                        = require('../enums/PhoneType');
import ScheduledTaskType                                                = require('../enums/ScheduledTaskType');
import PhoneCall                                                        = require('../models/PhoneCall');
import User                                                             = require('../models/User');
import UserPhone                                                        = require('../models/UserPhone');
import IntegrationMember                                                = require('../models/IntegrationMember');
import AbstractScheduledTask                                            = require('../models/tasks/AbstractScheduledTask');
import TriggerPhoneCallTask                                             = require('../models/tasks/TriggerPhoneCallTask');
import CallReminderNotificationScheduledTask                            = require('../models/tasks/CallReminderNotificationScheduledTask');
import Schedule                                                         = require('../models/Schedule');
import ForeignKey                                                       = require('../models/ForeignKey');
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
    private transactionLineDelegate = new TransactionLineDelegate();
    private callProvider = new CallProviderFactory().getProvider();
    private phoneCallCache = new PhoneCallCache();
    private scheduleExceptionDelegate = new ScheduleExceptionDelegate();

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

    get(id:any, fields?:string[], foreignKeys:ForeignKey[] = [], transaction?:Object):q.Promise<any>
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
                    return superGet.call(self, id, fields, foreignKeys, transaction);
            },
            function callFetchError()
            {
                return superGet(id, fields, foreignKeys);
            });
    }

    create(object:Object, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;

        // TODO: Check that we're not scheduling a conflicting call

        if (object[PhoneCall.COL_EXPERT_USER_ID] == object[PhoneCall.COL_CALLER_USER_ID])
            throw new Error("You can't call yourself!");

        return super.create(object, dbTransaction);
    }

    update(criteria:Object, newValues:Object, transaction?:Object):q.Promise<any>;
    update(criteria:number, newValues:Object, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:Object, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var updateProxy = super.update;

        var callId:number;
        if (Utils.getObjectType(criteria) == 'Number')
        {
            callId = criteria;
            criteria = {id: criteria};
        }
        else
            callId = criteria[PhoneCall.COL_ID];

        return self.get(callId,null,null,transaction)
            .then( function callFetched(call:PhoneCall){

                // Ensure we don't update to an invalid step (based on possible next steps)
                if (newValues.hasOwnProperty(PhoneCall.COL_STATUS))
                {
                    var allowedStatus = PhoneCallDelegate.ALLOWED_NEXT_STATUS[call.getStatus()];

                    var isNewStatusValid:boolean = false;
                    _.each(allowedStatus, function(status){
                        if (status == newValues[PhoneCall.COL_STATUS])
                            isNewStatusValid = true;
                    })
                    if(!isNewStatusValid)
                        return q.reject('Status Cannot be updated as such a change in status is not allowed. Call Id - ' + callId);
                }

                //check that caller User Id is not same as expert as one can't schedule call with himself
                if (newValues.hasOwnProperty(PhoneCall.COL_CALLER_USER_ID))
                {
                    if (newValues[PhoneCall.COL_CALLER_USER_ID] == call.getExpertUserId())
                        return q.reject('Call with self is not allowed');
                }

                //Ensure that the schedule time of call doesn't conflict with expert exceptions
                if (newValues.hasOwnProperty(PhoneCall.COL_START_TIME))
                {
                    return  self.getScheduledCalls(call.getExpertUserId(),transaction)
                        .then(
                        function scheduledCallsFetched(calls:PhoneCall[]):any
                        {
                            var startTime = newValues[PhoneCall.COL_START_TIME];
                            var durationInMillis = call.getDuration()*1000;
                            var isStartTimeValid:boolean = true;

                            _.each(calls, function (call:PhoneCall)
                            {
                                if ( !(startTime > (call.getStartTime() + call.getDuration()*1000)) && !((startTime + durationInMillis) < call.getStartTime()) )
                                    isStartTimeValid = false;
                            });

                            if (!isStartTimeValid)
                                return q.reject('Expert is not available at the proposed time. Please select some other slot.')

                            return q.resolve(true);
                        })
                }

                return q.resolve(true); //return a promise in start_time check is not required
            })
            .then( function newValuesChecked(){
                return updateProxy.call(self, criteria, newValues, transaction);
            })
    }

    /* Trigger the call */
    triggerCall(callId:number):q.Promise<any>
    {
        var self = this;
        return self.get(callId, null, [PhoneCall.FK_PHONE_CALL_CALLER_PHONE])
            .then(
            function callFetched(call:PhoneCall)
            {
                return [call, call.getUserPhone()];
            })
            .spread(
            function userPhoneFetched(...args)
            {
                var call:PhoneCall = args[0][0];
                var userPhone:UserPhone = args[0][1];

                return self.callProvider.makeCall(userPhone.getCompleteNumber(), callId, call.getNumReattempts());
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
    queueCallForTriggering(call:number):q.Promise<any>;
    queueCallForTriggering(call:PhoneCall):q.Promise<any>;
    queueCallForTriggering(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.get(call, null, [PhoneCall.FK_PHONE_CALL_CALLER, PhoneCall.FK_PHONE_CALL_EXPERT, PhoneCall.FK_PHONE_CALL_EXPERT_PHONE, PhoneCall.FK_PHONE_CALL_CALLER_PHONE])
                .then(function (fetchedCall:PhoneCall)
                {
                    self.queueCallForTriggering(fetchedCall);
                });

        // Queue call for triggering if it's before the scheduler will trigger again
        var startTime:number = (call.getStartTime() + (call.getDelay() || 0) * 1000);
        var error:string;

        // If call is scheduled for much later, skip queuing
        if (startTime < moment().valueOf() || startTime > (moment().add({seconds: Config.get(Config.PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS)})).valueOf())
        {
            self.logger.debug('Call id %s not queued for triggering because it scheduled for much later', call.getId());
            return q.resolve(true);
        }

        // Check number of attempts already made
        if ((call.getNumReattempts() || 0) > Config.get(Config.MAXIMUM_REATTEMPTS))
            error = 'Call has been tried maximum allowed times';

        // Check status of call is valid or not
        if (call.getStatus() != CallStatus.IN_PROGRESS && call.getStatus() != CallStatus.SCHEDULED)
            error = 'Call status not correct for queueing';

        var ScheduledTaskDelegate = require('../delegates/ScheduledTaskDelegate');
        var scheduledTaskDelegate = ScheduledTaskDelegate.getInstance();

        // Check whether the call has been scheduled already
        var callsAlreadyScheduledTasks:AbstractScheduledTask[] = scheduledTaskDelegate.filter(ScheduledTaskType.CALL);
        var alreadyScheduled = _.find(callsAlreadyScheduledTasks, function (callScheduledTask:any)
        {
            var callTask:TriggerPhoneCallTask = callScheduledTask;
            return callTask.getCallId() == call.getId()
        });
        if (!Utils.isNullOrEmpty(alreadyScheduled))
            error = 'Call already scheduled';

        // If no error, SCHEDULE!
        if (Utils.isNullOrEmpty(error))
        {
            var tasks = [
                scheduledTaskDelegate.scheduleAt(new TriggerPhoneCallTask(call.getId()), startTime),
                self.phoneCallCache.addCall(call, null, true)
            ];

            if ((call.getDelay() || 0) == 0) //send reminder only once
                tasks.push(scheduledTaskDelegate.scheduleAt(new CallReminderNotificationScheduledTask(call.getId()), call.getStartTime() - parseInt(Config.get(Config.CALL_REMINDER_LEAD_TIME_SECS)) * 1000));

            return q.all(tasks);
        }
        else
        {
            self.logger.debug('Queueing trigger failed for call id: %s, reason: %s', call.getId(), error);
            return q.reject(error);
        }
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
            self.update(call.getId(), Utils.createSimpleObject(PhoneCall.COL_STATUS, CallStatus.CANCELLED)),
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
                var scheduledTaskDelegate = ScheduledTaskDelegate.getInstance();

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
    processSchedulingRequest(callId:number, requesterUserId:number, originalSlots:number[], pickedSlots:number[], reason?:string, phoneNumberId?:number):q.Promise<any>
    {
        var notificationDelegate = new NotificationDelegate();
        var self = this;

        var isRejection = !Utils.isNullOrEmpty(reason);
        var isConfirmation = pickedSlots.length == 1 && _.contains(originalSlots, pickedSlots[0]);
        var isSuggestion = _.intersection(originalSlots, pickedSlots).length == 0;

        return self.get(callId, null, [PhoneCall.FK_PHONE_CALL_EXPERT, PhoneCall.FK_PHONE_CALL_CALLER])
            .then(
            function callFetched(call:PhoneCall):any
            {
                var isExpert = call.getExpertUserId() == requesterUserId;
                if(!Utils.isNullOrEmpty(phoneNumberId))
                {
                    if(isExpert)
                        call.setExpertPhoneId(phoneNumberId);
                    else
                        call.setCallerPhoneId(phoneNumberId);
                    return [call, self.update(callId, Utils.createSimpleObject(isExpert ? PhoneCall.COL_EXPERT_PHONE_ID: PhoneCall.COL_CALLER_PHONE_ID, phoneNumberId))];
                }
                else
                    return [call, true];
            })
            .spread(
            function phoneNumberUpdated(call:PhoneCall, updateQueryResult:Object):any
            {
                var isExpert = call.getExpertUserId() == requesterUserId;
                var isCaller = call.getCallerUserId() == requesterUserId;

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
                                self.queueCallForTriggering(callId),
                                notificationDelegate.sendCallSchedulingCompleteNotifications(callId, pickedSlots[0])
                            ]);
                        })
                        .then(
                        function sendResponse() { return CallStatus.SCHEDULED; })
                }
                else if (isSuggestion && call.getStatus() == CallStatus.SCHEDULING)
                {
                    // Send notification to other party
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
                    throw new Error('Invalid request');
            });
    }

    getScheduledCalls(userId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        return self.search({'expert_user_id':userId, 'status':[CallStatus.SCHEDULED, CallStatus.IN_PROGRESS]},[PhoneCall.COL_START_TIME, PhoneCall.COL_DURATION],null,transaction);
    }

    constructor() { super(new PhoneCallDao()); }
}
export = PhoneCallDelegate
