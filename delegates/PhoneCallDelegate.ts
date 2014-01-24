import _                        = require('underscore');
import q                        = require('q');
import Utils                    = require('../Utils');
import IDao                     = require('../dao/IDao');
import PhoneCallDao             = require('../dao/PhoneCallDao');
import BaseDAODelegate          = require('./BaseDaoDelegate');
import EmailDelegate            = require('./EmailDelegate');
import CallStatus               = require('../enums/CallStatus');
import PhoneCall                = require('../models/PhoneCall');

class PhoneCallDelegate extends BaseDAODelegate
{
    static ALLOWED_NEXT_STATUS:{ [s: number]: any[]; } = {};

    private static ctor = (() =>
    {
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.PENDING_SCHEDULING] = [CallStatus.SCHEDULED, CallStatus.CANCELLED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.SCHEDULED] = [CallStatus.CANCELLED, CallStatus.POSTPONED, CallStatus.IN_PROGRESS];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.CANCELLED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.COMPLETED] = [];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.IN_PROGRESS] = [CallStatus.COMPLETED, CallStatus.FAILED];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.FAILED] = [CallStatus.PENDING_SCHEDULING];
        PhoneCallDelegate.ALLOWED_NEXT_STATUS[CallStatus.POSTPONED] = [CallStatus.SCHEDULED, CallStatus.CANCELLED];
    })();

    callsByUser(user_id:string, filters:Object, fields?:string[]):q.makePromise
    {
        filters['user_id'] = user_id;
        return (_.keys(filters).length == 1) ? Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, {'fields': fields});
    }

    callsToExpert(expert_id:string, filters:Object, fields?:string[]):q.makePromise
    {
        filters['expert_id'] = expert_id;
        return (_.keys(filters).length == 1) ? Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, {'fields': fields});
    }

    update(criteria:Object, newValues:Object, transaction?:any):q.makePromise
    {
        if (newValues.hasOwnProperty('status'))
            throw new Error('Please use the method updateCallStatus to update call status');

        return super.update(criteria, newValues, transaction);
    }

    updateCallStatus(phoneCallId:number, newStatus:CallStatus):q.makePromise
    {
        var that = this;
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
                    return that.update({'id': phoneCallId}, {'status': newStatus});
                else
                {
                    var newStatusString = Utils.getEnumString(CallStatus, newStatus);
                    var oldStatusString = Utils.getEnumString(CallStatus, status);
                    throw new Error("Can't update call status to '" + newStatusString + "' since the call is " + oldStatusString);
                }
            })
            .then(
            function callUpdated()
            {
                return new EmailDelegate().sendCallStatusUpdateNotifications(callerUserId, expertUserId, CallStatus.POSTPONED);
            });

    }

    getDao():IDao { return new PhoneCallDao(); }
}
export = PhoneCallDelegate