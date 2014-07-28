import q                                                            = require('q');
import Config                                                       = require('../common/Config');
import EmailDelegate                                                = require('../delegates/EmailDelegate');
import SMSDelegate                                                  = require('../delegates/SMSDelegate');
import PhoneCall                                                    = require('../models/PhoneCall');
import IntegrationMember                                            = require('../models/IntegrationMember');
import CallFragment                                                 = require('../models/CallFragment');
import User                                                         = require('../models/User');
import CallReminderNotificationScheduledTask                        = require('../models/tasks/CallReminderNotificationScheduledTask');
import Utils                                                        = require('../common/Utils');

class NotificationDelegate
{
    private smsDelegate = new SMSDelegate();
    private emailDelegate = new EmailDelegate();
    private phoneCallDelegate;

    constructor()
    {
        var PhoneCallDelegate = require('../delegates/PhoneCallDelegate');
        this.phoneCallDelegate = new PhoneCallDelegate();
    }

    sendNewCallRequestNotifications(call:number, appointments:number[], duration:number, caller:User):q.Promise<any>;
    sendNewCallRequestNotifications(call:PhoneCall, appointments:number[], duration:number, caller:User):q.Promise<any>;
    sendNewCallRequestNotifications(call:any, appointments:number[], duration:number, caller:User):q.Promise<any>
    {
        var self = this;

        return self.emailDelegate.sendNewCallRequestNotifications(call, appointments, duration, caller);
    }

    sendCallSchedulingCompleteNotifications(call:number, appointment:number):q.Promise<any>;
    sendCallSchedulingCompleteNotifications(call:PhoneCall, appointment:number):q.Promise<any>;
    sendCallSchedulingCompleteNotifications(call:any, appointment:number):q.Promise<any>
    {
        var self = this;
        return self.emailDelegate.sendSchedulingCompleteEmail(call, appointment);
    }

    sendSuggestedAppointmentToCaller(call:number, appointment:number, expertUserId:number):q.Promise<any>;
    sendSuggestedAppointmentToCaller(call:PhoneCall, appointment:number, expertUserId:number):q.Promise<any>;
    sendSuggestedAppointmentToCaller(call:any, appointment:number, expertUserId:number):q.Promise<any>
    {
        var self = this;
        return self.emailDelegate.sendSuggestedAppointmentToCaller(call, appointment, expertUserId);
    }

    sendNewTimeSlotsToExpert(call:number, appointments:number[], callerUserId:number):q.Promise<any>;
    sendNewTimeSlotsToExpert(call:PhoneCall, appointments:number[], callerUserId:number):q.Promise<any>;
    sendNewTimeSlotsToExpert(call:any, appointments:number[], callerUserId:number):q.Promise<any>
    {
        var self = this;
        return self.emailDelegate.sendNewTimeSlotsToExpert(call, appointments, callerUserId);
    }

    sendCallRejectedNotifications(call:number, reason:string):q.Promise<any>;
    sendCallRejectedNotifications(call:PhoneCall, reason:string):q.Promise<any>;
    sendCallRejectedNotifications(call:any, reason:string):q.Promise<any>
    {
        var self = this;
        return self.emailDelegate.sendCallRequestRejectedEmail(call, reason);
    }

    sendCallReminderNotification(call:number):q.Promise<any>;
    sendCallReminderNotification(call:PhoneCall):q.Promise<any>;
    sendCallReminderNotification(call:any):q.Promise<any>
    {
        var self = this;
        return q.all([
            self.smsDelegate.sendReminderSMS(call),
            self.emailDelegate.sendCallReminderEmail(call)
        ]);
    }

    sendCallFailureNotifications(call:PhoneCall):q.Promise<any>;
    sendCallFailureNotifications(call:number):q.Promise<any>;
    sendCallFailureNotifications(call:any):q.Promise<any>
    {
        var self = this;

        return q.all([
            self.smsDelegate.sendFailureSMS(call),
            self.emailDelegate.sendCallFailureEmail(call)
        ]);
    }

    sendCallSuccessNotifications(call:number, duration:number):q.Promise<any>;
    sendCallSuccessNotifications(call:PhoneCall, duration:number):q.Promise<any>;
    sendCallSuccessNotifications(call:any, duration:number):q.Promise<any>
    {
        var self = this;

        return self.smsDelegate.sendSuccessSMS(call, duration);
    }

    sendCallStatusNotifications(callFragment:CallFragment, attemptCount:number):q.Promise<any>
    {
        return null;
    }

    sendAccountVerificationEmail(user:User, code:string):q.Promise<any>
    {
        return this.emailDelegate.sendAccountVerificationEmail(user, code);
    }

    sendPasswordResetNotification(email:string, code:string):q.Promise<any>
    {
        return this.emailDelegate.sendPasswordResetEmail(email, code);
    }

    sendExpertRegistrationCompleteNotification(expert:IntegrationMember):q.Promise<any>
    {
        var self = this;

        return self.emailDelegate.sendExpertRegistrationCompleteEmail(expert);
    }

    sendMemberAddedNotification(member:IntegrationMember, passwordResetCode?:string):q.Promise<any>
    {
        return this.emailDelegate.sendMemberAddedEmail(member, passwordResetCode);
    }

    sendIntegrationCreatedEmail(integrationOwner:IntegrationMember):q.Promise<any>
    {
        return this.emailDelegate.sendIntegrationCreatedEmail(integrationOwner);
    }
}
export = NotificationDelegate