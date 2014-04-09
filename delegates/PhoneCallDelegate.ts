///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import cron                         = require('cron');
import Utils                        = require('../common/Utils');
import IDao                         = require('../dao/IDao');
import PhoneCallDao                 = require('../dao/PhoneCallDao');
import BaseDAODelegate              = require('./BaseDaoDelegate');
import MysqlDelegate                = require('./MysqlDelegate');
import IntegrationMemberDelegate    = require('./IntegrationMemberDelegate');
import TransactionDelegate          = require('./TransactionDelegate');
import TransactionLineDelegate      = require('./TransactionLineDelegate');
import EmailDelegate                = require('./EmailDelegate');
import CallStatus                   = require('../enums/CallStatus');
import IncludeFlag                  = require('../enums/IncludeFlag');
import TransactionStatus            = require('../enums/TransactionStatus');
import PhoneCall                    = require('../models/PhoneCall');
import Transaction                  = require('../models/Transaction');
import TransactionLine              = require('../models/TransactionLine');
import UnscheduledCallsCache        = require('../caches/UnscheduledCallsCache');

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
        if (object[PhoneCall.STATUS] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.addUnscheduledCall(object[PhoneCall.EXPERT_ID], object[PhoneCall.START_TIME], object);

        var createdCall;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        return super.create(object, transaction)
            .then(
            function callCreated(call:PhoneCall)
            {
                createdCall = call;

                var t = new Transaction();
                t.setStatus(TransactionStatus.PENDING);
                t.setTotalUnit(createdCall.getPriceCurrency());
                t.setUserId(createdCall.getCallerId());
                return new TransactionDelegate().createPhoneCallTransaction(t, call, transaction);
            });
    }

    search(search:Object, options?:Object):q.Promise<any>
    {
        if (search[PhoneCall.STATUS] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.getUnscheduledCalls(search[PhoneCall.EXPERT_ID], search[PhoneCall.START_TIME]);
        return super.search(search, options);
    }

    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
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

        return this.get(phoneCallId, ['status', 'caller_user_id', 'expert_id', 'start_time', 'duration'])
            .then(
            function phoneCallFetched(call:PhoneCall)
            {
                var status = call.getStatus();
                callerUserId = call.getCallerId();
                expertUserId = call.getExpertId();

                if (_.contains(PhoneCallDelegate.ALLOWED_NEXT_STATUS[status], newStatus))
                    return self.update({'id': phoneCallId}, {'status': newStatus});
                else
                    throw new Error("Can't update call status to '" + CallStatus[newStatus] + "' since the call is " + CallStatus[status]);
            })
            .then(
            function callUpdated()
            {
                return new EmailDelegate().sendCallStatusUpdateNotifications(callerUserId, expertUserId, CallStatus.POSTPONED);
            });
    }

    getIncludeHandler(include:IncludeFlag, result:PhoneCall):q.Promise<any>
    {
        switch (include)
        {
            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER_USER:
                return new IntegrationMemberDelegate().get(result.getExpertId(), null, [IncludeFlag.INCLUDE_USER]);
        }
        return super.getIncludeHandler(include, result);
    }

    getDao():IDao { return new PhoneCallDao(); }
}
export = PhoneCallDelegate