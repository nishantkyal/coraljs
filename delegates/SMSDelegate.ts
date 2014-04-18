///<reference path='../_references.d.ts'/>
import _                                                            = require('underscore');
import q                                                            = require('q');
import log4js                                                       = require('log4js');
import Config                                                       = require('../common/Config');
import Utils                                                        = require('../common/Utils');
import ISmsProvider                                                 = require('../providers/ISmsProvider');
import BaseDaoDelegate                                              = require('../delegates/BaseDaoDelegate');
import LocalizationDelegate                                         = require('../delegates/LocalizationDelegate');
import UserPhoneDelegate                                            = require('../delegates/UserPhoneDelegate');
import IDao                                                         = require('../dao/IDao');
import SMS                                                          = require('../models/SMS');
import CallFragment                                                 = require('../models/CallFragment');
import User                                                         = require('../models/User');
import IntegrationMember                                            = require('../models/IntegrationMember');
import PhoneCall                                                    = require('../models/PhoneCall');
import UserPhone                                                    = require('../models/UserPhone');
import Priority                                                     = require('../enums/Priority');
import PhoneType                                                    = require('../enums/PhoneType');
import SMSStatus                                                    = require('../enums/SMSStatus');
import CallFragmentStatus                                           = require('../enums/CallFragmentStatus');
import IncludeFlag                                                  = require('../enums/IncludeFlag');
import SmsProviderFactory                                           = require('../factories/SmsProviderFactory');

class SMSDelegate
{
    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private smsProvider:ISmsProvider = new SmsProviderFactory().getProvider();
    private phoneCallDelegate;

    constructor()
    {
        var PhoneCallDelegate = require('../delegates/PhoneCallDelegate');
        this.phoneCallDelegate = new PhoneCallDelegate();
    }

    sendReminderSMS(call:number):q.Promise<any>;
    sendReminderSMS(call:PhoneCall):q.Promise<any>;
    sendReminderSMS(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return this.phoneCallDelegate.get(call).then(self.sendReminderSMS);

        var smsTasks = [];
        var smsTemplate = _.template(LocalizationDelegate.get('sms.reminder'));
        var smsMessage:string = smsTemplate({callId: call, minutes: Config.get(Config.CALL_REMINDER_LEAD_TIME_SECS) / 60});

        if (call.getCallerPhone().getType() == PhoneType.MOBILE)
            smsTasks.push(self.smsProvider.sendSMS(call.getCallerPhone().getCompleteNumber(), smsMessage));

        if (call.getExpertPhone().getType() == PhoneType.MOBILE)
            smsTasks.push(self.smsProvider.sendSMS(call.getExpertPhone().getCompleteNumber(), smsMessage));

        return q.all(smsTasks)
            .fail(
            function (error)
            {
                self.logger.debug("Error in sending reminder SMS, error: %s", error);
            });
    }

    sendStatusSMS(callFragment:CallFragment, attemptCount:number):q.Promise<any>
    {
        switch (callFragment.getCallFragmentStatus())
        {
            case CallFragmentStatus.FAILED_EXPERT_ERROR:
            case CallFragmentStatus.FAILED_SERVER_ERROR:
                if (attemptCount == 0)
                    return this.sendRetrySMS(callFragment.getCallId());
                else
                    return this.sendFailureSMS(callFragment.getCallId());
                break;

            case CallFragmentStatus.FAILED_USER_ERROR:
                if (attemptCount == 0)
                    return this.sendRetrySMS(callFragment.getCallId());
                else
                    return this.sendFailureUserSMS(callFragment.getCallId());
                break;

            case CallFragmentStatus.FAILED_MINIMUM_DURATION:
                break; // not sending any SMS in this case as new call is generated

            case CallFragmentStatus.SUCCESS:
                return this.sendSuccessSMS(callFragment.getCallId(), callFragment.getDuration());
                break;
        }

        return null;
    }

    sendSuccessSMS(call:number, duration:number):q.Promise<any>;
    sendSuccessSMS(call:PhoneCall, duration:number):q.Promise<any>;
    sendSuccessSMS(call:any, duration:number):q.Promise<any>
    {
        var self = this;

        var userMessageTemplate = _.template(LocalizationDelegate.get('sms.user.success'));
        var expertMessageTemplate = _.template(LocalizationDelegate.get('sms.expert.success'));

        var userMessage:string = userMessageTemplate({
            callId: call.getId(),
            duration: duration,
            phoneNumber: Config.get(Config.KOOKOO_NUMBER)
        });

        var expertMessage:string = expertMessageTemplate({
            callId: call.getId(),
            duration: duration
        });

        return q.all([
            self.smsProvider.sendSMS(call.getCallerPhone().getCompleteNumber(), userMessage),
            self.smsProvider.sendSMS(call.getExpertPhone().getCompleteNumber(), expertMessage)
        ])
            .then(
            function smsSent()
            {
                self.logger.info("Success SMS sent to user: %s & expert: %s", call.getCallerPhone().getCompleteNumber(), call.getExpertPhone().getCompleteNumber());
            });
    }

    sendRetrySMS(call:number):q.Promise<any>;
    sendRetrySMS(call:PhoneCall):q.Promise<any>;
    sendRetrySMS(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return this.phoneCallDelegate.get(call).then(self.sendRetrySMS);

        var retryMessageTemplate = _.template(LocalizationDelegate.get('sms.retry'));

        var retryMessage:string = retryMessageTemplate({
            callId: call.getId(),
            minutes: Math.ceil(Config.get(Config.CALL_RETRY_DELAY_SECS) / 60)
        });

        return q.all([
            self.smsProvider.sendSMS(call.getCallerPhone().getCompleteNumber(), retryMessage),
            self.smsProvider.sendSMS(call.getExpertPhone().getCompleteNumber(), retryMessage)
        ]);
    }

    sendFailureSMS(call:number):q.Promise<any>;
    sendFailureSMS(call:PhoneCall):q.Promise<any>;
    sendFailureSMS(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return this.phoneCallDelegate.get(call).then(self.sendFailureSMS);

        var userFailureTemplate = _.template(LocalizationDelegate.get('sms.user.failure'));
        var expertFailureTemplate = _.template(LocalizationDelegate.get('sms.expert.failure'));

        var userFailureMessage = userFailureTemplate({callId: call.getId()});
        var expertFailureMessage = expertFailureTemplate({callId: call.getId()});

        return q.all([
            self.smsProvider.sendSMS(call.getCallerPhone().getCompleteNumber(), userFailureMessage),
            self.smsProvider.sendSMS(call.getExpertPhone().getCompleteNumber(), expertFailureMessage)
        ])
            .then(
            function smsSent()
            {
                this.logger.info("Failure SMS sent to user number: " + call.getCallerPhone().getCompleteNumber());
                this.logger.info("Failure SMS sent to expert number: " + call.getExpertPhone().getCompleteNumber());
            });
    }

    sendFailureUserSMS(call:PhoneCall):q.Promise<any>;
    sendFailureUserSMS(call:number):q.Promise<any>;
    sendFailureUserSMS(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return this.phoneCallDelegate.get(call).then(self.sendFailureUserSMS);

        var template:Function = _.template(LocalizationDelegate.get('sms.user.failure.user'));
        var message:string = template({
            callId: call.getId(),
            minutes: Math.ceil(Config.get(Config.CALL_RETRY_DELAY_SECS) / 60),
            phoneNumber: Config.get(Config.KOOKOO_NUMBER)
        });

        return self.smsProvider.sendSMS(call.getCallerPhone().getCompleteNumber(), message)
            .then(
            function smsSent()
            {
                this.logger.info("Failure(User) SMS sent to user number: " + call.getCallerPhone().getCompleteNumber());
            });
    }

    sendVerificationSMS(userNumber:string, code:string):q.Promise<any>
    {
        var self = this;

        var template:Function = _.template(LocalizationDelegate.get('sms.VERIFY_NUMBER'));
        var message:string = template({
            code: code
        });

        return self.smsProvider.sendSMS(userNumber, message)
            .then(
            function smsSent()
            {
                this.logger.info("Verification SMS sent to user number: " + userNumber);
            });
    }
}
export = SMSDelegate