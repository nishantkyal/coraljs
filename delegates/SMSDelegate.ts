///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import q                                                = require('q');
import log4js                                           = require('log4js');
import Config                                           = require('../common/Config');
import Utils                                            = require('../common/Utils');
import LocalizationDelegate                             = require('../delegates/LocalizationDelegate');
import UserPhoneDelegate                                = require('../delegates/UserPhoneDelegate');
import PhoneCallDelegate                                = require('../delegates/PhoneCallDelegate');
import IDao                                             = require('../dao/IDao');
import SMS                                              = require('../models/SMS');
import CallFragment                                     = require('../models/CallFragment');
import User                                             = require('../models/User');
import IntegrationMember                                = require('../models/IntegrationMember');
import PhoneCall                                        = require('../models/PhoneCall');
import UserPhone                                        = require('../models/UserPhone');
import Priority                                         = require('../enums/Priority');
import PhoneType                                        = require('../enums/PhoneType');
import SMSStatus                                        = require('../enums/SMSStatus');
import CallFragmentStatus                               = require('../enums/CallFragmentStatus');
import IncludeFlag                                      = require('../enums/IncludeFlag');
import SmsProviderFactory                               = require('../factories/SmsProviderFactory');
import PhoneCallCache                                   = require('../caches/PhoneCallCache');
import PhoneCallCacheModel                              = require('../caches/models/PhoneCallCacheModel');


class SMSDelegate
{
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    sendReminderSMS(callId:number):q.Promise<any>
    {
        var self = this;
        return new PhoneCallCache().getPhoneCall(callId)
            .then(
            function CallFetched(call:any):any
            {
                var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                if (phoneCallCacheObj.getUserPhoneType() == PhoneType.MOBILE)
                {
                    var bodyUser = _.template(LocalizationDelegate.get('sms.reminder'));
                    self.logger.info("Reminder SMS sent to user number:  " + phoneCallCacheObj.getUserNumber());
                    return new SmsProviderFactory().getProvider().sendSMS(phoneCallCacheObj.getUserNumber(), bodyUser({callId: callId, minutes: Config.get('sms.reminder.time') / 60})); //TODO
                }
                if (phoneCallCacheObj.getExpertPhoneType() == PhoneType.MOBILE)
                {
                    var bodyExpert = _.template(LocalizationDelegate.get('sms.reminder'));
                    self.logger.info("Reminder SMS sent to expert number: " + phoneCallCacheObj.getExpertNumber());
                    return new SmsProviderFactory().getProvider().sendSMS(phoneCallCacheObj.getExpertNumber(), bodyExpert({callId: callId, minutes: Config.get('sms.reminder.time') / 60})); //TODO
                }
            })
            .fail(
            function (error)
            {
                self.logger.debug("Error in sending reminder SMS");
            });
    }

    sendStatusSMS(callFragment:CallFragment, attemptCount:number):q.Promise<any>
    {
        switch (callFragment.getCallFragmentStatus())
        {
            case CallFragmentStatus.FAILED_EXPERT_ERROR:
            case CallFragmentStatus.FAILED_SERVER_ERROR:
                if (attemptCount == 0)
                    return this.sendRetrySMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId());
                else
                    return this.sendFailureSMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId());
                break;
            case CallFragmentStatus.FAILED_USER_ERROR:
                if (attemptCount == 0)
                    return this.sendRetrySMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId());
                else
                    return this.sendFailureUserSMS(callFragment.getFromNumber(), callFragment.getCallId());
                break;
            case CallFragmentStatus.FAILED_MINIMUM_DURATION:
                break; // not sending any SMS in this case as new call is generated
            case CallFragmentStatus.SUCCESS:
                return this.sendSuccessSMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId(), callFragment.getDuration());
                break;
        }
    }

    sendSuccessSMS(expertNumber:UserPhone, userNumber:UserPhone, callId:number, duration:number):q.Promise<any>
    {
        var bodyUser = _.template(LocalizationDelegate.get('sms.user.success'));
        var bodyExpert = _.template(LocalizationDelegate.get('sms.expert.success'));

        return q.all([
            new SmsProviderFactory().getProvider().sendSMS(expertNumber, bodyExpert({callId: callId, duration: duration})),
            new SmsProviderFactory().getProvider().sendSMS(userNumber, bodyUser({callId: callId, duration: duration, phoneNumber: Config.get('kookoo.number')}))
        ]);
    }

    sendRetrySMS(expertNumber:UserPhone, userNumber:UserPhone, callId:number):q.Promise<any>
    {
        var body = _.template(LocalizationDelegate.get('sms.retry'));

        return q.all([
            new SmsProviderFactory().getProvider().sendSMS(expertNumber, body({callId: callId, minutes: Config.get('call.retry.gap')})),
            new SmsProviderFactory().getProvider().sendSMS(userNumber, body({callId: callId, minutes: Config.get('call.retry.gap')}))
        ]);
    }

    sendFailureSMS(expertNumber:UserPhone, userNumber:UserPhone, callId:number):q.Promise<any>
    {
        var bodyUser = _.template(LocalizationDelegate.get('sms.user.failure'));
        var bodyExpert = _.template(LocalizationDelegate.get('sms.expert.failure'));

        return q.all([
                new SmsProviderFactory().getProvider().sendSMS(expertNumber, bodyExpert({callId: callId})),
                new SmsProviderFactory().getProvider().sendSMS(userNumber, bodyUser({callId: callId}))
            ])
            .then(
            function smsSent()
            {

            },
            function smsSendFailed()
            {

            }
        );
    }

    sendFailureUserSMS(userNumber:UserPhone, callId:number):q.Promise<any>
    {
        var body = _.template(LocalizationDelegate.get('sms.user.failure.user'));
        this.logger.info("Failure(User) SMS sent to user number: " + userNumber);
        return new SmsProviderFactory().getProvider().sendSMS(userNumber, body({callId: callId, minutes: Config.get('call.retry.gap'), phoneNumber: Config.get('kookoo.number')}));
    }

    sendVerificationSMS()
    {

    }
}
export = SMSDelegate