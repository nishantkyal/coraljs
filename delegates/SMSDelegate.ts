///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import q                                                = require('q');
import SmsCountryDelegate                               = require('../delegates/calling/SmsCountryDelegate');
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

        sms.setStatus(SMSStatus.SCHEDULED);
        sms.setNumRetries(0);

        // TODO: Enter into SMS queue if send fails
        return new SmsCountryDelegate().sendSMS(sms.getPhone().getCompleteNumber(), sms.getMessage(), sms.getSender());
    }

    generateSMSText(smsTemplate:SmsTemplate, data:Object, locale:string = 'en'):string
    {
        var template = _.template(LocalizationDelegate.get('sms.' + SmsTemplate[smsTemplate], locale))
        return template(data);
    }

}
export = SMSDelegate