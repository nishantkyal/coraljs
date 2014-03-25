///<reference path='../_references.d.ts'/>
import _                                                                = require('underscore');
import q                                                                = require('q');
import Utils                                                            = require('../common/Utils');
import Config                                                           = require('../common/Config');
import IDao                                                             = require('../dao/IDao');
import PhoneCallDao                                                     = require('../dao/PhoneCallDao');
import BaseDAODelegate                                                  = require('./BaseDaoDelegate');
import IntegrationMemberDelegate                                        = require('./IntegrationMemberDelegate');
import UserPhoneDelegate                                                = require('./UserPhoneDelegate');
import EmailDelegate                                                    = require('./EmailDelegate');
import UserDelegate                                                     = require('../delegates/UserDelegate');
import CallStatus                                                       = require('../enums/CallStatus');
import IncludeFlag                                                      = require('../enums/IncludeFlag');
import PhoneType							                            = require('../enums/PhoneType');
import PhoneCall							                            = require('../models/PhoneCall');
import User								                                = require('../models/User');
import UserPhone							                            = require('../models/UserPhone');
import IntegrationMember						                        = require('../models/IntegrationMember');
import UnscheduledCallsCache						                    = require('../caches/UnscheduledCallsCache');
import PhoneCallCache							                        = require('../caches/PhoneCallCache');
import PhoneCallCacheModel						                        = require('../caches/models/PhoneCallCacheModel');
import CallProviderFactory						                        = require('../factories/CallProviderFactory');

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
        return this.dao.search(filters, {'fields': fields});
    }

    callsToExpert(expert_id:string, filters:Object, fields?:string[]):q.Promise<any>
    {
        filters['expert_id'] = expert_id;
        return this.dao.search(filters, {'fields': fields});
    }

    create(object:any, transaction?:any):q.Promise<any>
    {
        if (object['status'] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.addUnscheduledCall(object['integration_member_id'], object['schedule_id'], object);
        return super.create(object, transaction);
    }

    search(search:Object):q.Promise<any>
    {
        if (search['status'] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.getUnscheduledCalls(search['integration_member_id'], search['schedule_id']);
        return super.search(search);
    }

    update(criteria:Object, newValues:Object, transaction?:any):q.Promise<any>
    update(criteria:number, newValues:Object, transaction?:any):q.Promise<any>
    update(criteria:any, newValues:Object, transaction?:any):q.Promise<any>
    {
        if (newValues.hasOwnProperty('status'))
            throw new Error('Please use the method updateCallStatus to update call status');

        return super.update(criteria, newValues, transaction);
    }

    updateCallStatus(criteria:number, newStatus:CallStatus):q.Promise<any>
    updateCallStatus(criteria:Object, newStatus:CallStatus):q.Promise<any>
    updateCallStatus(criteria:any, newStatus:CallStatus):q.Promise<any>
    {
        var self = this;
        var callerUserId:number;
        var expertUserId:number;

        return this.find(criteria, null, ['status', 'caller_user_id', 'expert_id', 'start_time', 'duration'])
            .then(
            function phoneCallFetched(call):any
            {
                callerUserId = call['caller_user_id'];
                expertUserId = call['expert_id'];
                var status = call.status;

                if (PhoneCallDelegate.ALLOWED_NEXT_STATUS[status].indexOf(newStatus) != -1)
                    return self.update(criteria, {'status': newStatus});
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
        var phoneCallDao:any = this.dao;
        return phoneCallDao.getCallsBetweenInterval(startTime, endTime);
    }

    getIncludeHandler(include:IncludeFlag, result:PhoneCall):q.Promise<any>
    {
        switch (include)
        {
            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER_USER:
                return new IntegrationMemberDelegate().get(result.getIntegrationMemberId(), null, [IncludeFlag.INCLUDE_USER]);
            case IncludeFlag.INCLUDE_USER:
                return new UserDelegate().get(result.getCallerUserId());
        }
        return super.getIncludeHandler(include, result);
    }

    triggerCall(callId:number):q.Promise<any>
    {
        var self = this;
        return new PhoneCallCache().getPhoneCall(callId)
            .then(
            function CallFetched(call:any)
            {
                var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                return new CallProviderFactory().getProvider().makeCall(phoneCallCacheObj.getUserNumber(), callId, phoneCallCacheObj.getNumReattempts());
            })
            .fail(function(error){
                self.logger.debug("Error in call triggering");
            })
    }

    constructor() { super(new PhoneCallDao()); }
}
export = PhoneCallDelegate