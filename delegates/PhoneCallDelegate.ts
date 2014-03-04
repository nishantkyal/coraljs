///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import Utils                        = require('../common/Utils');
import IDao                         = require('../dao/IDao');
import PhoneCallDao                 = require('../dao/PhoneCallDao');
import BaseDAODelegate              = require('./BaseDaoDelegate');
import IntegrationMemberDelegate    = require('./IntegrationMemberDelegate');
import UserPhoneDelegate            = require('./UserPhoneDelegate');
import EmailDelegate                = require('./EmailDelegate');
import CallStatus                   = require('../enums/CallStatus');
import ApiFlags                     = require('../enums/ApiFlags');
import PhoneCall                    = require('../models/PhoneCall');
import User                         = require('../models/User');
import UserPhone                    = require('../models/UserPhone');
import UnscheduledCallsCache        = require('../caches/UnscheduledCallsCache');
import UserDelegate                 = require('../delegates/UserDelegate');
import Config                       = require('../common/Config');

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

    triggerCall(callId:number, url:string):any
    {
        var client = require('twilio')(Config.get('twilio.account_sid'), Config.get('twilio.auth_token'));
        var user:User;
        new PhoneCallDelegate().get(callId, null, [ApiFlags.INCLUDE_USER])
            .then(
            function callFetched(call:PhoneCall)
            {
                user = call[ApiFlags.INCLUDE_USER];
                new UserPhoneDelegate().getByUserId(user.getId())
                    .then(
                    function PhoneRecord(userPhone:UserPhone[])
                    {
                        var phoneNumber:string = '+' + userPhone[0].getCountryCode();
                        if(userPhone[0].getType() == 1) //TODO create model for phone_type
                            phoneNumber += userPhone[0].getAreaCode();
                        phoneNumber += userPhone[0].getPhone();

                        client.calls.create({
                            url: url,
                            to: phoneNumber,
                            from: Config.get('twilio.number'),
                            method: "GET"
                        }, function(err, call) {
                            process.stdout.write(call.sid);
                        });
                    }
                )
            },
            function callFetchError(error) { return error;});
    }

    getDao():IDao { return new PhoneCallDao(); }
}
export = PhoneCallDelegate