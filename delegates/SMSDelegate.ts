import q                            = require('q');
import BaseDaoDelegate              = require('../delegates/BaseDaoDelegate');
import TwilioDelegate               = require('./calling/TwilioDelegate');
import IDao                         = require('../dao/IDao');
import SMSDao                       = require('../dao/SmsDao');
import SMS                          = require('../models/SMS');
import Priority                     = require('../enums/Priority');
import SMSStatus                    = require('../enums/SMSStatus');

class SMSDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new SMSDao(); }

    send(sms:SMS):q.makePromise
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
}
export = SMSDelegate