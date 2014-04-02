///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import EmailDelegate                                        = require('../delegates/EmailDelegate');
import SmsProviderFactory                                   = require('../factories/SmsProviderFactory');
import ISmsProvider                                         = require('../providers/ISmsProvider');

class NotificationDelegate
{
    private smsProvider = new SmsProviderFactory().getProvider();
    private emailDelegate = new EmailDelegate();

    sendCallSchedulingNotifications(callId:number):q.Promise<any>
    {
        return null;
    }
}
export = NotificationDelegate