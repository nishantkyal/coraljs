///<reference path='../_references.d.ts'/>
import _                                                                = require('underscore');
import q                                                                = require('q');
import Utils                                                            = require('../common/Utils');
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
import CallProviderFactory                                              = require('../factories/CallProviderFactory');

class PhoneCallDelegate extends BaseDAODelegate
{
    static ALLOWED_NEXT_STATUS:{ [s: number]: CallStatus[]; } = {};

    private unscheduledCallsCache:UnscheduledCallsCache = new UnscheduledCallsCache();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private callProvider = new CallProviderFactory().getProvider();
    private phoneCallCache = new PhoneCallCache();

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
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.AGENDA_DECLINED] = [CallStatus.SCHEDULING];
    })();

    get(id:any, fields?:string[], includes:IncludeFlag[] = []):q.Promise<any>
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
                    return superGet.call(self, id, fields, includes);
            },
            function callFetchError()
            {
                return superGet(id, fields, includes);
            });
    }

    create(object:any, transaction?:any):q.Promise<any>
    {
        //TODO[alpha-calling] remoce the comment
        //if (object[PhoneCall.STATUS] == CallStatus.PLANNING)
        //    return this.unscheduledCallsCache.addUnscheduledCall(object[PhoneCall.EXPERT_PHONE_ID], object[PhoneCall.START_TIME], object);
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
        var newStatus = newValues.hasOwnProperty(PhoneCall.STATUS) ? newValues[PhoneCall.STATUS] : null;

        if (!Utils.isNullOrEmpty(newStatus))
        {
            if (Utils.getObjectType(criteria) == 'Number')
                criteria = {id: criteria};

            // Only return calls whose current status' next step can be the new status
            // This is a better way to update status to a valid next status without querying for current status first
            var allowedPreviousStatuses:CallStatus[] = _.filter(_.keys(PhoneCallDelegate.ALLOWED_NEXT_STATUS), function (status:CallStatus)
            {
                return _.contains(PhoneCallDelegate.ALLOWED_NEXT_STATUS[status], newStatus);
            });

            if (allowedPreviousStatuses.length > 0)
                criteria[PhoneCall.STATUS] = allowedPreviousStatuses;
        }

        return super.update(criteria, newValues, transaction);
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
            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER:
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
        return self.get(callId,null, [IncludeFlag.INCLUDE_USER_PHONE])
            .then(
            function callFetched(call:PhoneCall)
            {
                return self.callProvider.makeCall(call.getUserPhone().getCompleteNumber(), callId, call.getNumReattempts());
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