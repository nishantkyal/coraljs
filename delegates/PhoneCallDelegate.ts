///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import Utils                        = require('../common/Utils');
import Config                       = require('../common/Config');
import IDao                         = require('../dao/IDao');
import PhoneCallDao                 = require('../dao/PhoneCallDao');
import BaseDAODelegate              = require('./BaseDaoDelegate');
import IntegrationMemberDelegate    = require('./IntegrationMemberDelegate');
import UserPhoneDelegate            = require('./UserPhoneDelegate');
import EmailDelegate                = require('./EmailDelegate');
import TimeJobDelegate              = require('../delegates/TimeJobDelegate');
import MysqlDelegate                = require('../delegates/MysqlDelegate');
import UserDelegate                 = require('../delegates/UserDelegate');
import SMSDelegate                  = require('../delegates/SMSDelegate');
import CallFragmentDelegate         = require('./CallFragmentDelegate');
import CallStatus                   = require('../enums/CallStatus');
import ApiFlags                     = require('../enums/ApiFlags');
import PhoneType                    = require('../enums/PhoneType');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import PhoneCall                    = require('../models/PhoneCall');
import User                         = require('../models/User');
import UserPhone                    = require('../models/UserPhone');
import IntegrationMember            = require('../models/IntegrationMember');
import CallFragment                 = require('../models/CallFragment');
import UnscheduledCallsCache        = require('../caches/UnscheduledCallsCache');
import PhoneCallCache               = require('../caches/PhoneCallCache');
import PhoneCallCacheModel          = require('../caches/models/PhoneCallCacheModel');
import CallProviderFactory          = require('../factories/CallProviderFactory');

class PhoneCallDelegate extends BaseDAODelegate
{
    static ALLOWED_NEXT_STATUS:{ [s: number]: any[]; } = {};

    private unscheduledCallsCache:UnscheduledCallsCache = new UnscheduledCallsCache();

    private static ctor = (() =>
    {
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.PLANNING] = [CallStatus.SCHEDULED, CallStatus.CANCELLED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.SCHEDULED] = [CallStatus.CANCELLED, CallStatus.POSTPONED, CallStatus.IN_PROGRESS];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.CANCELLED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.COMPLETED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.IN_PROGRESS] = [CallStatus.COMPLETED, CallStatus.FAILED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.FAILED] = [CallStatus.PLANNING];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.POSTPONED] = [CallStatus.SCHEDULED, CallStatus.CANCELLED];
    })();

    callsByUser(user_id:string, filters:Object, fields?:string[]):q.Promise<any>
    {
        filters['user_id'] = user_id;
        return this.getDao().search(filters, {'fields': fields});
    }

    callsToExpert(expert_id:string, filters:Object, fields?:string[]):q.Promise<any>
    {
        filters['expert_id'] = expert_id;
        return this.getDao().search(filters, {'fields': fields});
    }

    create(object:any, transaction?:any):q.Promise<any>
    {
        if (object['status'] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.addUnscheduledCall(object['integration_member_id'], object['schedule_id'], object);
        return super.create(object, transaction);
    }

    search(search:Object, options?:Object):q.Promise<any>
    {
        if (search['status'] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.getUnscheduledCalls(search['integration_member_id'], search['schedule_id']);
        return super.search(search, options);
    }

    update(criteria:Object, newValues:Object, transaction?:any):q.Promise<any>
    {
        if (newValues.hasOwnProperty('status'))
            throw new Error('Please use the method updateCallStatus to update call status');

        return super.update(criteria, newValues, transaction);
    }

    updateCallStatus(phoneCallId:number, newStatus:CallStatus):q.Promise<any>
    {
        var self = this;
        var callerUserId:number;
        var expertUserId:number;

        return this.get(phoneCallId, ['status', 'caller_user_id', 'integration_member_id', 'start_time', 'duration'])
            .then(
            function phoneCallFetched(call)
            {
                callerUserId = call['caller_user_id'];
                expertUserId = call['expert_id'];
                var status = call.status;

                if (PhoneCallDelegate.ALLOWED_NEXT_STATUS[status].indexOf(newStatus) != -1)
                    return self.update({'id': phoneCallId}, {'status': newStatus});
                else
                {
                    var newStatusString = CallStatus[newStatus];
                    var oldStatusString = CallStatus[status];
                    throw new Error("Can't update call status to '" + newStatusString + "' since the call is " + oldStatusString);
                }
            })
            .then(
            function callUpdated()
            {
                return new EmailDelegate().sendCallStatusUpdateNotifications(callerUserId, expertUserId, CallStatus.POSTPONED);
            });

    }

    getCallsBetweenInterval(startTime:number, endTime:number):q.Promise<any>
    {
        var phoneCallDao:any = this.getDao();
        return phoneCallDao.getCallsBetweenInterval(startTime,endTime);
    }

    getIncludeHandler(include:string, result:PhoneCall):q.Promise<any>
    {
        switch (include)
        {
            case ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER:
                return new IntegrationMemberDelegate().get(result.getIntegrationMemberId(), null, [ApiFlags.INCLUDE_USER]);
            case ApiFlags.INCLUDE_USER:
                return new UserDelegate().get(result.getCallerUserId());
        }
        return super.getIncludeHandler(include, result);
    }

    triggerCall(callId:number):q.Promise<any>
    {
        var self = this;
        var tempPhoneCallCacheObj:PhoneCallCacheModel
        return new PhoneCallCache().getPhoneCall(callId)
            .then(
            function CallFetched(call:any){
                var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                tempPhoneCallCacheObj = phoneCallCacheObj;
                return new CallProviderFactory().getProvider().makeCall(phoneCallCacheObj.getUserNumber(), callId, phoneCallCacheObj.getNumReattempts());
            })
            .fail(function(error){
                self.logger.debug("Error in call triggering %s", callId);
                if(tempPhoneCallCacheObj.getNumReattempts() == 0)
                    self.rescheduleCall(callId, tempPhoneCallCacheObj.getNumReattempts());

                var callFragment:CallFragment = new CallFragment(); //save information received in CallFragment
                callFragment.setCallId(callId);
                callFragment.setFromNumber(tempPhoneCallCacheObj.getUserNumber());
                callFragment.setToNumber(tempPhoneCallCacheObj.getExpertNumber());
                callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_SERVER_ERROR);
                new CallFragmentDelegate().create(callFragment);

                //TODO don't send sms to landline (twilio doesn't send it and return error code 21614). However, we should not even make the api call.
                new SMSDelegate().sendStatusSMS(callFragment, tempPhoneCallCacheObj.getNumReattempts());

                if(tempPhoneCallCacheObj.getNumReattempts() == 1)
                {
                    self.logger.debug("Error in call triggering again %s, call cancelled", callId);
                    self.updateCallStatus(callId, CallStatus.FAILED);
                }
            })
    }

    rescheduleCall(callId:number, attemptCount:number):q.Promise<any>
    {
        var self = this;
        this.logger.info("Call being rescheduled callId:" + callId);
        var transaction = null;
        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                return  new PhoneCallDelegate().update({id:callId}, {num_reattempts:attemptCount+1, delay:Config.get('call.retry.gap')*60});
            })
            .then(
            function dbUpdated()
            {
                return new PhoneCallCache().updatePhoneCallCache(callId, {num_reattempts:attemptCount+1, delay:Config.get('call.retry.gap')*60});
            })
            .then(
            function exceptionsDeleted()
            {
                new TimeJobDelegate().rescheduleJob(callId, Config.get('call.retry.gap')*60);
                return MysqlDelegate.commit(transaction);
            })
            .fail(
            function(error){
                self.logger.debug("error in rescheduling callId:" + callId);
            })
    }

    getDao():IDao { return new PhoneCallDao(); }
}
export = PhoneCallDelegate