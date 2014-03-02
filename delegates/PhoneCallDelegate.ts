///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
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
import TransacitionStatus           = require('../enums/TransactionStatus');
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
        if (object['status'] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.addUnscheduledCall(object['integration_member_id'], object['schedule_id'], object);

        var createdCall;
        var superCreate = super.create;
        var self = this;

        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                superCreate.call(self, object, transaction)
            })
            .then(
            function callCreated(call)
            {
                createdCall = call;

                var t = new Transaction();
                t.setStatus(TransacitionStatus.PENDING);
                t.setTotalUnit(call.getPriceCurrency());
                t.setUserId(call.getCallerId());
                return new TransactionDelegate().create(t, transaction);
            })
            .then(
            function transactionCreated(transaction)
            {
                var transactionLine = new TransactionLine();
                transactionLine.setTransactionId(transaction.getId());
                transactionLine.setAmount(createdCall.getPrice());
                transactionLine.setAmountUnit(createdCall.getPriceCurrency());
                transactionLine.setProductType(1);

                return new TransactionLineDelegate().create(transactionLine, transaction);
            });
    }

    search(search:Object, options?:Object):q.Promise<any>
    {
        if (search['status'] == CallStatus.PLANNING)
            return this.unscheduledCallsCache.getUnscheduledCalls(search['integration_member_id'], search['schedule_id']);
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