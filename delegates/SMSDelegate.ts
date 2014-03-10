///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('../delegates/BaseDaoDelegate');
import LocalizationDelegate         = require('../delegates/LocalizationDelegate');
import TwilioDelegate               = require('./calling/TwilioDelegate');
import IDao                         = require('../dao/IDao');
import SMSDao                       = require('../dao/SmsDao');
import SMS                          = require('../models/SMS');
import CallFragment                 = require('../models/CallFragment');
import Priority                     = require('../enums/Priority');
import SMSStatus                    = require('../enums/SMSStatus');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import Config                       = require('../common/Config');
import Utils                        = require('../common/Utils');


class SMSDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new SMSDao(); }

    send(sms:SMS):q.Promise<any>
    {
        if (!sms.getPriority()) sms.setPriority(Priority.LOWEST);
        if (!sms.getScheduledDate()) sms.setScheduledDate(new Date().getTime());
        if (!sms.getSender()) sms.setSender('TM-SEARCHNTALK');
        sms.setStatus(SMSStatus.SCHEDULED);
        sms.setNumRetries(0);

        return this.create(sms)
            .then(
            function smsSaved()
            {
                return new TwilioDelegate().sendSMS(sms.getCountryCode() + sms.getPhone(), sms.getSender(), sms.getMessage());
            })
            .then(
            function smsSent()
            {
                return sms;
            });
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
        var body = _.template(LocalizationDelegate.get('sms.user.success'));
        new TwilioDelegate().sendSMS(userNumber, body({callId:callId, duration:duration, phoneNumber:Config.get('kookoo.number')}));
        body = _.template(LocalizationDelegate.get('sms.expert.success'));
        new TwilioDelegate().sendSMS(expertNumber, body({callId:callId, duration:duration}));
    }

    sendRetrySMS(expertNumber:string, userNumber:string,  callId:number)
    {
        var body = _.template(LocalizationDelegate.get('sms.retry'));
        new TwilioDelegate().sendSMS(userNumber, body({callId:callId, minutes:Config.get('call.retry.gap')}));
        if(!Utils.isNullOrEmpty(expertNumber))
            new TwilioDelegate().sendSMS(expertNumber, body({callId:callId, minutes:Config.get('call.retry.gap')}));
    }

    sendFailureSMS(expertNumber:string, userNumber:string,  callId:number)
    {
        var body = _.template(LocalizationDelegate.get('sms.user.failure'));
        new TwilioDelegate().sendSMS(userNumber, body({callId:callId}));
        if(!Utils.isNullOrEmpty(expertNumber))
        {
            body = _.template(LocalizationDelegate.get('sms.expert.failure'));
            new TwilioDelegate().sendSMS(expertNumber, body({callId:callId}));
        }
    }

    sendFailureUserSMS(userNumber:string,  callId:number)
    {
        var body = _.template(LocalizationDelegate.get('sms.user.failure.user'));
        return new TwilioDelegate().sendSMS(userNumber, body({callId:callId, minutes:Config.get('call.retry.gap'), phoneNumber:Config.get('kookoo.number')}));
    }
}
export = SMSDelegate