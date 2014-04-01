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
import PhoneCallDelegate                                            = require('./PhoneCallDelegate');
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
import PhoneCallCache                                               = require('../caches/PhoneCallCache');
import PhoneCallCacheModel                                          = require('../caches/models/PhoneCallCacheModel');

class SMSDelegate
{
    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private smsProvider:ISmsProvider = new SmsProviderFactory().getProvider();

    sendReminderSMS(callId:number)
    {
        var self = this;
        // TODO: Don't call cache directly, access calls using delegate
        new PhoneCallCache().getPhoneCall(callId)
            .then(
            function CallFetched(call:any)
            {
                var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                var smsTasks = [];

                if (phoneCallCacheObj.getUserPhoneType() == PhoneType.MOBILE)
                {
                    var userTemplete = _.template(LocalizationDelegate.get('sms.reminder'));
                    var userMessage = userTemplete({callId: callId, minutes: Config.get('sms.reminder.time') / 60});

                    smsTasks.push(self.smsProvider.sendSMS(phoneCallCacheObj.getUserNumber(), userMessage));
                }

                if (phoneCallCacheObj.getExpertPhoneType() == PhoneType.MOBILE)
                {
                    var expertTemplete = _.template(LocalizationDelegate.get('sms.reminder'));
                    var expertMessage = expertTemplete({callId: callId, minutes: Config.get('sms.reminder.time') / 60});

                    smsTasks.push(self.smsProvider.sendSMS(phoneCallCacheObj.getExpertNumber(), expertMessage));
                }

                return q.all(smsTasks);
            })
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

        return null;
    }

    sendSuccessSMS(expertNumber:string, userNumber:string, callId:number, duration:number):q.Promise<any>
    {
        var self = this;

        var userMessageTemplate = _.template(LocalizationDelegate.get('sms.user.success'));
        var expertMessageTemplate = _.template(LocalizationDelegate.get('sms.expert.success'));

        var userMessage:string = userMessageTemplate({
            callId: callId,
            duration: duration,
            phoneNumber: Config.get('kookoo.number')
        });

        var expertMessage:string = expertMessageTemplate({
            callId: callId,
            duration: duration
        });

        return q.all([
                self.smsProvider.sendSMS(userNumber, userMessage),
                self.smsProvider.sendSMS(expertNumber, expertMessage)
            ])
            .then(
            function smsSent()
            {
                self.logger.info("Success SMS sent to user number: %s", userNumber);
                self.logger.info("Success SMS sent to expert number: %s", expertNumber);
            }
        );
    }

    sendRetrySMS(expertNumber:string, userNumber:string, callId:number):q.Promise<any>
    {
        var self = this;

        var retryMessageTemplate = _.template(LocalizationDelegate.get('sms.retry'));

        var retryMessage:string = retryMessageTemplate({
            callId: callId,
            minutes: Config.get('call.retry.gap')
        });

        return q.all([
            self.smsProvider.sendSMS(userNumber, retryMessage),
            self.smsProvider.sendSMS(expertNumber, retryMessage)
        ]);
    }

    sendFailureSMS(expertNumber:string, userNumber:string, callId:number):q.Promise<any>
    {
        var self = this;

        var userFailureTemplate = _.template(LocalizationDelegate.get('sms.user.failure'));
        var expertFailureTemplate = _.template(LocalizationDelegate.get('sms.expert.failure'));

        var userFailureMessage = userFailureTemplate({callId: callId});
        var expertFailureMessage = expertFailureTemplate({callId: callId});

        return q.all([
                self.smsProvider.sendSMS(userNumber, userFailureMessage),
                self.smsProvider.sendSMS(expertNumber, expertFailureMessage)
            ])
            .then(
            function smsSent()
            {
                this.logger.info("Failure SMS sent to user number: " + userNumber);
                this.logger.info("Failure SMS sent to expert number: " + expertNumber);
            });
    }

    sendFailureUserSMS(userNumber:string, callId:number):q.Promise<any>
    {
        var self = this;

        var template:Function = _.template(LocalizationDelegate.get('sms.user.failure.user'));
        var message:string = template({
            callId: callId,
            minutes: Config.get('call.retry.gap'),
            phoneNumber: Config.get('kookoo.number')
        });

        return self.smsProvider.sendSMS(userNumber, message)
            .then(
            function smsSent()
            {
                this.logger.info("Failure(User) SMS sent to user number: " + userNumber);
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