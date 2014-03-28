///<reference path='../_references.d.ts'/>
import _                                                                = require('underscore');
import q                                                                = require('q');
import Utils                                                            = require('../common/Utils');
import Config                                                           = require('../common/Config');
import IDao                                                             = require('../dao/IDao');
import PhoneCallDao                                                     = require('../dao/PhoneCallDao');
import BaseDAODelegate                                                  = require('../delegates/BaseDaoDelegate');
import IntegrationMemberDelegate                                        = require('../delegates/IntegrationMemberDelegate');
import UserPhoneDelegate                                                = require('../delegates/UserPhoneDelegate');
import UserDelegate                                                     = require('../delegates/UserDelegate');
import CallStatus                                                       = require('../enums/CallStatus');
import IncludeFlag                                                      = require('../enums/IncludeFlag');
import PhoneType                                                        = require('../enums/PhoneType');
import PhoneCall                                                        = require('../models/PhoneCall');
import User                                                             = require('../models/User');
import UserPhone                                                        = require('../models/UserPhone');
import IntegrationMember                                                = require('../models/IntegrationMember');
import UnscheduledCallsCache                                            = require('../caches/UnscheduledCallsCache');
import PhoneCallCache                                                   = require('../caches/PhoneCallCache');
import PhoneCallCacheModel                                              = require('../caches/models/PhoneCallCacheModel');
import CallProviderFactory                                              = require('../factories/CallProviderFactory');

class PhoneCallDelegate extends BaseDAODelegate
{
    static ALLOWED_NEXT_STATUS:{ [s: number]: any[]; } = {};

    private unscheduledCallsCache:UnscheduledCallsCache = new UnscheduledCallsCache();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private callProvider = new CallProviderFactory().getProvider();

    private static ctor = (() =>
    {
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.PLANNING] = [CallStatus.SCHEDULING, CallStatus.CANCELLED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.SCHEDULING] = [CallStatus.SCHEDULED, CallStatus.CANCELLED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.SCHEDULED] = [CallStatus.CANCELLED, CallStatus.POSTPONED, CallStatus.IN_PROGRESS];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.CANCELLED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.COMPLETED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.IN_PROGRESS] = [CallStatus.COMPLETED, CallStatus.FAILED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.FAILED] = [CallStatus.SCHEDULING];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.POSTPONED] = [CallStatus.SCHEDULING, CallStatus.CANCELLED];
    })();

    create(object:any, transaction?:any):q.Promise<any>
    {
        if (object[PhoneCall.STATUS] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.addUnscheduledCall(object['integration_member_id'], object['schedule_id'], object);
        return super.create(object, transaction);
    }

    search(search:Object):q.Promise<any>
    {
        if (search[PhoneCall.STATUS] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.getUnscheduledCalls(search['integration_member_id'], search['schedule_id']);
        return super.search(search);
    }

    update(criteria:Object, newValues:Object, transaction?:any):q.Promise<any>;
    update(criteria:number, newValues:Object, transaction?:any):q.Promise<any>;
    update(criteria:any, newValues:Object, transaction?:any):q.Promise<any>
    {
        var self = this;
        var callerPhoneId:number;
        var expertPhoneId:number;
        var newStatus = newValues.hasOwnProperty(PhoneCall.STATUS) ? newValues[PhoneCall.STATUS] : null;
        var superUpdate = super.update;

        return this.find(criteria, [PhoneCall.STATUS, PhoneCall.CALLER_PHONE_ID, PhoneCall.EXPERT_PHONE_ID])
            .then(
            function phoneCallFetched(call:PhoneCall):any
            {
                callerPhoneId = call.getCallerUserId();
                expertPhoneId = call.getExpertPhoneId();
                var status = call.getStatus();

                if (!Utils.isNullOrEmpty(newStatus))
                    if (PhoneCallDelegate.ALLOWED_NEXT_STATUS[status].indexOf(newStatus) != -1)
                        return superUpdate(criteria, {'status': newStatus});
                    else
                    {
                        var newStatusString = CallStatus[newStatus];
                        var oldStatusString = CallStatus[status];
                        throw new Error("Can't update call status to '" + newStatusString + "' since the call is " + oldStatusString);
                    }
            });
    }

    getCallsBetweenInterval(startTime:number, endTime:number):q.Promise<any>
    {
        var phoneCallDao:any = this.dao;
        return phoneCallDao.getCallsBetweenInterval(startTime, endTime);
    }

    getIncludeHandler(include:IncludeFlag, result:PhoneCall):q.Promise<any>
    {
        var self = this;
        switch (include)
        {
            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER_USER:
                return self.integrationMemberDelegate.get(result.getIntegrationMemberId(), null, [IncludeFlag.INCLUDE_USER]);
            case IncludeFlag.INCLUDE_USER:
                return self.userDelegate.get(result.getCallerUserId());
            case IncludeFlag.INCLUDE_EXPERT_PHONE:
                return self.userPhoneDelegate.get(result.getExpertPhoneId());
            case IncludeFlag.INCLUDE_USER_PHONE:
                return self.userPhoneDelegate.get(result.getCallerPhoneId());
        }
        return super.getIncludeHandler(include, result);
    }

    triggerCall(callId:number):q.Promise<any>
    {
        var self = this;
        return self.get(callId)
            .then(
            function callFetched(call:any)
            {
                var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                return self.callProvider.makeCall(phoneCallCacheObj.getUserNumber(), callId, phoneCallCacheObj.getNumReattempts());
            })
            .fail(
            function callFailed(error)
            {
                self.logger.error("Error in call triggering");
            });
    }

    constructor() { super(new PhoneCallDao()); }
}
export = PhoneCallDelegate