///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import Config                       = require('../common/Config');
import Utils                        = require('../common/Utils');
import BaseDaoDelegate              = require('../delegates/BaseDaoDelegate');
import LocalizationDelegate         = require('../delegates/LocalizationDelegate');
import UserPhoneDelegate            = require('../delegates/UserPhoneDelegate');
import PhoneCallDelegate            = require('./PhoneCallDelegate');
import IDao                         = require('../dao/IDao');
import SMSDao                       = require('../dao/SmsDao');
import SMS                          = require('../models/SMS');
import CallFragment                 = require('../models/CallFragment');
import User                         = require('../models/User');
import IntegrationMember            = require('../models/IntegrationMember');
import PhoneCall                    = require('../models/PhoneCall');
import UserPhone                    = require('../models/UserPhone');
import Priority                     = require('../enums/Priority');
import PhoneType                    = require('../enums/PhoneType');
import SMSStatus                    = require('../enums/SMSStatus');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import ApiFlags                     = require('../enums/ApiFlags');
import SmsProviderFactory           = require('../factories/SmsProviderFactory');


class SMSDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new SMSDao(); }

    sendReminderSMS(callId:number)
    {
        var self = this;
        var user_phone_id:number,  expert_phone_id:number;
        new PhoneCallDelegate().get(callId, null, [ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER])
            .then(
            function callFetched(call:PhoneCall)
            {
                user_phone_id = call.getCallerPhoneId();
                expert_phone_id = call.getExpertPhoneId();
                return new UserPhoneDelegate().get(expert_phone_id);
            })
            .then(
            function PhoneRecord(expertPhone:UserPhone)
            {
                new UserPhoneDelegate().get(user_phone_id)
                .then(
                function PhoneRecordUser(userPhone:UserPhone)
                {
                    var expertNumber:string = '+' + expertPhone.getCountryCode() +  expertPhone.getPhone();
                    var userNumber:string = '+' + userPhone.getCountryCode() +  userPhone.getPhone();
                    if(userPhone.getType() == PhoneType.MOBILE)
                    {
                        var bodyUser = _.template(LocalizationDelegate.get('sms.reminder'));
                        self.logger.info("Reminder SMS sent to user number:  " + userNumber );
                        new SmsProviderFactory().getProvider().sendSMS(userNumber, bodyUser({callId:callId, minutes:Config.get('sms.reminder.time')/60})); //TODO
                    }
                    if(expertPhone.getType() == PhoneType.MOBILE)
                    {
                        var bodyExpert = _.template(LocalizationDelegate.get('sms.reminder'));
                        self.logger.info("Reminder SMS sent to expert number: " + expertNumber );
                        new SmsProviderFactory().getProvider().sendSMS(expertNumber, bodyExpert({callId:callId, minutes:Config.get('sms.reminder.time')/60})); //TODO
                    }
                })
            })
            .fail(
            function(error)
            {
                self.logger.debug("Error in sending reminder SMS");
            })
    }

    sendStatusSMS(callFragment:CallFragment, attemptCount:number)
    {
        switch(callFragment.getCallFragmentStatus())
        {
            case CallFragmentStatus.FAILED_EXPERT_ERROR:
            case CallFragmentStatus.FAILED_SERVER_ERROR:
                if(attemptCount == 0)
                    this.sendRetrySMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId());
                else
                    this.sendFailureSMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId());
                break;
            case CallFragmentStatus.FAILED_USER_ERROR:
                if(attemptCount == 0)
                    this.sendRetrySMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId());
                else
                    this.sendFailureUserSMS(callFragment.getFromNumber(), callFragment.getCallId());
                break;
            case CallFragmentStatus.FAILED_MINIMUM_DURATION:
                break; // not sending any SMS in this case as new call is generated
            case CallFragmentStatus.SUCCESS:
                this.sendSuccessSMS(callFragment.getToNumber(), callFragment.getFromNumber(), callFragment.getCallId(), callFragment.getDuration());
                break;
        }
    }

    sendSuccessSMS(expertNumber:string ,userNumber:string, callId:number, duration:number)
    {
        var bodyUser = _.template(LocalizationDelegate.get('sms.user.success'));
        this.logger.info("Success SMS sent to user number: " + userNumber );
        new SmsProviderFactory().getProvider().sendSMS(userNumber, bodyUser({callId:callId, duration:duration, phoneNumber:Config.get('kookoo.number')}));
        var bodyExpert = _.template(LocalizationDelegate.get('sms.expert.success'));
        this.logger.info("Success SMS sent to expert number: " + expertNumber );
        new SmsProviderFactory().getProvider().sendSMS(expertNumber, bodyExpert({callId:callId, duration:duration}));
    }

    sendRetrySMS(expertNumber:string, userNumber:string,  callId:number)
    {
        var body = _.template(LocalizationDelegate.get('sms.retry'));
        this.logger.info("Retry SMS sent to user number: " + userNumber );
        new SmsProviderFactory().getProvider().sendSMS(userNumber, body({callId:callId, minutes:Config.get('call.retry.gap')}));
        if(!Utils.isNullOrEmpty(expertNumber))
        {
            this.logger.info("Retry SMS sent to expert number: " + expertNumber );
            new SmsProviderFactory().getProvider().sendSMS(expertNumber, body({callId:callId, minutes:Config.get('call.retry.gap')}));
        }
    }

    sendFailureSMS(expertNumber:string, userNumber:string,  callId:number)
    {
        var bodyUser = _.template(LocalizationDelegate.get('sms.user.failure'));
        this.logger.info("Failure SMS sent to user number: " + userNumber );
        new SmsProviderFactory().getProvider().sendSMS(userNumber, bodyUser({callId:callId}));
        if(!Utils.isNullOrEmpty(expertNumber))
        {
            this.logger.info("Failure SMS sent to expert number: " + expertNumber );
            var bodyExpert = _.template(LocalizationDelegate.get('sms.expert.failure'));
            new SmsProviderFactory().getProvider().sendSMS(expertNumber, bodyExpert({callId:callId}));
        }
    }

    sendFailureUserSMS(userNumber:string,  callId:number)
    {
        var body = _.template(LocalizationDelegate.get('sms.user.failure.user'));
        this.logger.info("Failure(User) SMS sent to user number: " + userNumber );
        return new SmsProviderFactory().getProvider().sendSMS(userNumber, body({callId:callId, minutes:Config.get('call.retry.gap'), phoneNumber:Config.get('kookoo.number')}));
    }
}
export = SMSDelegate