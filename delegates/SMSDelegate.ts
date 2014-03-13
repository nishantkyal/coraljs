///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import q                                                = require('q');
import TwilioDelegate                                   = require('../delegates/calling/TwilioDelegate');
import LocalizationDelegate                             = require('../delegates/LocalizationDelegate');
import SMS                                              = require('../models/SMS');
import Priority                                         = require('../enums/Priority');
import SMSStatus                                        = require('../enums/SMSStatus');
import SmsTemplate                                      = require('../enums/SmsTemplate');

class SMSDelegate
{
    send(sms:SMS):q.Promise<any>
    {
        if (!sms.getPriority()) sms.setPriority(Priority.LOWEST);
        if (!sms.getScheduledDate()) sms.setScheduledDate(new Date().getTime());
        if (!sms.getSender()) sms.setSender('TM-SEARCHNTALK');

        sms.setStatus(SMSStatus.SCHEDULED);
        sms.setNumRetries(0);

        // TODO: Enter into SMS queue if send fails
        return new TwilioDelegate().sendSMS(sms.getPhone().getCompleteNumber(), sms.getSender(), sms.getMessage());
    }

    generateSMSText(smsTemplate:SmsTemplate, data:Object, locale:string = 'en'):string
    {
        var template = _.template(LocalizationDelegate.get(SmsTemplate[smsTemplate], locale))
        return template(data);
    }

}
export = SMSDelegate