///<reference path='../_references.d.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/PhoneCallDao.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='./EmailDelegate.ts'/>
///<reference path='../enums/CallStatus.ts'/>
///<reference path='../models/PhoneCall.ts'/>
///<reference path='../caches/UnscheduledCallsCache.ts'/>

module delegates
{
    export class PhoneCallDelegate extends BaseDAODelegate
    {
        static ALLOWED_NEXT_STATUS:{ [s: number]: any[]; } = {};

        private unscheduledCallsCache:UnscheduledCallsCache = new UnscheduledCallsCache();

        private static ctor = (() =>
        {
            PhoneCallDelegate.ALLOWED_NEXT_STATUS[enums.CallStatus.PLANNING] = [enums.CallStatus.SCHEDULED, enums.CallStatus.CANCELLED];
            PhoneCallDelegate.ALLOWED_NEXT_STATUS[enums.CallStatus.SCHEDULED] = [enums.CallStatus.CANCELLED, enums.CallStatus.POSTPONED, enums.CallStatus.IN_PROGRESS];
            PhoneCallDelegate.ALLOWED_NEXT_STATUS[enums.CallStatus.CANCELLED] = [];
            PhoneCallDelegate.ALLOWED_NEXT_STATUS[enums.CallStatus.COMPLETED] = [];
            PhoneCallDelegate.ALLOWED_NEXT_STATUS[enums.CallStatus.IN_PROGRESS] = [enums.CallStatus.COMPLETED, enums.CallStatus.FAILED];
            PhoneCallDelegate.ALLOWED_NEXT_STATUS[enums.CallStatus.FAILED] = [enums.CallStatus.PLANNING];
            PhoneCallDelegate.ALLOWED_NEXT_STATUS[enums.CallStatus.POSTPONED] = [enums.CallStatus.SCHEDULED, enums.CallStatus.CANCELLED];
        })();

        callsByUser(user_id:string, filters:Object, fields?:string[]):Q.Promise
        {
            filters['user_id'] = user_id;
            return (_.keys(filters).length == 1) ? common.Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, {'fields': fields});
        }

        callsToExpert(expert_id:string, filters:Object, fields?:string[]):Q.Promise
        {
            filters['expert_id'] = expert_id;
            return (_.keys(filters).length == 1) ? common.Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, {'fields': fields});
        }

        create(object:any, transaction?:any):Q.Promise
        {
            if (object['status'] == enums.CallStatus.PLANNING)
                return this.unscheduledCallsCache.addUnscheduledCall(object['integration_member_id'], object['schedule_id'], object);
            return super.create(object, transaction);
        }

        search(search:Object, options?:Object):Q.Promise
        {
            if (search['status'] == enums.CallStatus.PLANNING)
                return this.unscheduledCallsCache.getUnscheduledCalls(search['integration_member_id'], search['schedule_id']);
            return super.search(search, options);
        }

        update(criteria:Object, newValues:Object, transaction?:any):Q.Promise
        {
            if (newValues.hasOwnProperty('status'))
                throw new Error('Please use the method updateCallStatus to update call status');

            return super.update(criteria, newValues, transaction);
        }

        updateCallStatus(phoneCallId:number, newStatus:enums.CallStatus):Q.Promise
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
                        var newStatusString = enums.CallStatus[newStatus];
                        var oldStatusString = enums.CallStatus[status];
                        throw new Error("Can't update call status to '" + newStatusString + "' since the call is " + oldStatusString);
                    }
                })
                .then(
                function callUpdated()
                {
                    return new EmailDelegate().sendCallStatusUpdateNotifications(callerUserId, expertUserId, enums.CallStatus.POSTPONED);
                });

        }

        getDao():dao.IDao { return new dao.PhoneCallDao(); }
    }
}