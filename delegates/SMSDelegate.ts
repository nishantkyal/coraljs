///<reference path='../_references.d.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='./calling/TwilioDelegate.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/SmsDao.ts'/>
///<reference path='../models/SMS.ts'/>
///<reference path='../enums/Priority.ts'/>
///<reference path='../enums/SMSStatus.ts'/>

module delegates
{
    export class SMSDelegate extends BaseDaoDelegate
    {
        getDao():dao.IDao { return new dao.SmsDao(); }

        send(sms:models.SMS):Q.Promise<any>
        {
            if (!sms.getPriority()) sms.setPriority(enums.Priority.LOWEST);
            if (!sms.getScheduledDate()) sms.setScheduledDate(new Date().getTime());
            if (!sms.getSender()) sms.setSender('TM-SEARCHNTALK');
            sms.setStatus(enums.SMSStatus.SCHEDULED);
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
}