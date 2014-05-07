///<reference path='../_references.d.ts'/>
import _                                                            = require('underscore');
import url                                                          = require('url');
import cheerio                                                      = require('cheerio');
import fs                                                           = require('fs');
import log4js                                                       = require('log4js');
import path                                                         = require('path');
import q                                                            = require('q');
import nodemailer                                                   = require('nodemailer');
import watch                                                        = require('watch');
import Email                                                        = require('../models/Email')
import User                                                         = require('../models/User')
import Integration                                                  = require('../models/Integration')
import IntegrationMember                                            = require('../models/IntegrationMember')
import ExpertSchedule                                               = require('../models/ExpertSchedule');
import PhoneCall                                                    = require('../models/PhoneCall');
import ApiConstants                                                 = require('../enums/ApiConstants');
import CallStatus                                                   = require('../enums/CallStatus');
import IncludeFlag                                                  = require('../enums/IncludeFlag');
import IntegrationMemberRole                                        = require('../enums/IntegrationMemberRole');
import ApiUrlDelegate                                               = require('../delegates/ApiUrlDelegate');
import UserDelegate                                                 = require('../delegates/UserDelegate');
import IntegrationDelegate                                          = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                                    = require('../delegates/IntegrationMemberDelegate');
import VerificationCodeDelegate                                     = require('../delegates/VerificationCodeDelegate');
import FileWatcherDelegate                                          = require('../delegates/FileWatcherDelegate');
import PhoneCallDelegate                                            = require('../delegates/PhoneCallDelegate');
import Utils                                                        = require('../common/Utils');
import Config                                                       = require('../common/Config');
import Formatter                                                    = require('../common/Formatter');
import ExpertRegistrationUrls                                       = require('../routes/expertRegistration/Urls');
import DashboardUrls                                                = require('../routes/dashboard/Urls');

/*
 Delegate class for managing email
 1. Queue new email
 2. Check status of emails
 3. Search emails
 */
class EmailDelegate
{
    private static EMAIL_PASSWORD_RESET:string = 'EMAIL_PASSWORD_RESET';
    private static EMAIL_EXPERT_INVITE:string = 'EMAIL_EXPERT_INVITE';
    private static EMAIL_EXPERT_WELCOME:string = 'EMAIL_EXPERT_WELCOME';
    private static EMAIL_EXPERT_REMIND_MOBILE_VERIFICATION:string = 'EMAIL_EXPERT_REMIND_MOBILE_VERIFICATION';
    private static EMAIL_EXPERT_SCHEDULING:string = 'EMAIL_EXPERT_SCHEDULING';
    private static EMAIL_EXPERT_SCHEDULED:string = 'EMAIL_EXPERT_SCHEDULED';
    private static EMAIL_EXPERT_REMINDER:string = 'EMAIL_EXPERT_REMINDER';
    private static EMAIL_EXPERT_RESCHEDULE:string = 'EMAIL_EXPERT_RESCHEDULE';
    private static EMAIL_ACCOUNT_VERIFICATION:string = 'EMAIL_ACCOUNT_VERIFICATION';
    private static EMAIL_USER_REMINDER:string = 'EMAIL_USER_REMINDER';
    private static EMAIL_USER_SCHEDULED:string = 'EMAIL_USER_SCHEDULED';
    private static EMAIL_USER_AGENDA_FAIL:string = 'EMAIL_USER_AGENDA_FAIL';
    private static EMAIL_USER_RESCHEDULE:string = 'EMAIL_USER_RESCHEDULE';
    private static EMAIL_PROFILE_PENDING_APPROVAL:string = 'EMAIL_PROFILE_PENDING_APPROVAL';
    // TODO: Implement this
    private static EMAIL_USER_ACCOUNT_INCOMPLETE_REMINDER:string = 'EMAIL_USER_ACCOUNT_INCOMPLETE_REMINDER';

    private static templateCache:{[templateNameAndLocale:string]:{bodyTemplate:Function; subjectTemplate:Function}} = {};
    private static transport:nodemailer.Transport;
    private static logger:log4js.Logger = log4js.getLogger('EmailDelegate');
    private phoneCallDelegate;
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();

    constructor()
    {
        var PhoneCallDelegate = require('../delegates/PhoneCallDelegate');
        this.phoneCallDelegate = new PhoneCallDelegate();
        
        if (Utils.isNullOrEmpty(EmailDelegate.transport))
            EmailDelegate.transport = nodemailer.createTransport('SMTP', {
                service: 'SendGrid',
                auth: {
                    user: 'infollion',
                    pass: 'infollion123'
                }
            });
    }

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        new FileWatcherDelegate(Config.get(Config.EMAIL_TEMPLATE_BASE_DIR), [new RegExp('\.html$')],
            function initHandler(files)
            {
                _.each(files, function (fileName) { EmailDelegate.readFileAndCache(fileName); });
            },
            EmailDelegate.readFileAndCache,
            EmailDelegate.readFileAndCache);
    })();

    private static readFileAndCache(filePath)
    {
        var fileName = filePath.substring(filePath.lastIndexOf(path.sep) + 1);
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        if (extension != 'html') return;

        var fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
        fs.readFile(filePath, 'utf8', function (err, data)
        {
            if (data)
            {
                EmailDelegate.templateCache[fileNameWithoutExtension.toUpperCase()] =
                {
                    'bodyTemplate': _.template(data),
                    'subjectTemplate': _.template(cheerio.load(data)('title').text())
                };
                EmailDelegate.logger.debug('Email template updated: ' + fileNameWithoutExtension.toUpperCase());
            }
        });
    }

    private composeAndSend(template:string, to:string, emailData:Object, from?:string, replyTo?:string):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer<any>();

        emailData["email_cdn_base_uri"] = Config.get(Config.EMAIL_CDN_BASE_URI);
        from = from || 'SearchNTalk.com\<contact@searchntalk.com\>';
        replyTo = replyTo || 'no-reply\<no-reply@searchntalk.com\>';

        try
        {
            var body:string = this.getEmailBody(template, emailData);
            var subject:string = this.getEmailSubject(template, emailData);
        } catch (e)
        {
            EmailDelegate.logger.error('Invalid email template: ' + template);
            deferred.reject("Invalid email data");
            return null;
        }

        EmailDelegate.transport.sendMail(
            {
                from: from,
                to: to,
                replyTo: replyTo,
                subject: subject,
                html: body,
                forceEmbeddedImages: true
            },
            function emailSent(error:Error, response:any)
            {
                if (error)
                {
                    EmailDelegate.logger.info('Error in sending Email to:' + to);
                    deferred.reject(error);
                }
                else
                {
                    EmailDelegate.logger.info('Email sent to:' + to);
                    deferred.resolve(response);
                }
            }
        );

        return deferred.promise;
    }

    getEmailBody(template:string, emailData:Object):string
    {
        var self = this;
        try
        {
            var bodyTemplate:Function = EmailDelegate.templateCache[template].bodyTemplate;
            return bodyTemplate(emailData);
        }
        catch (err)
        {
            EmailDelegate.logger.error("Couldn't generate email body for (template %s, data: %s), Error: %s", template, JSON.stringify(emailData), JSON.stringify(err));
            throw(err);
        }
    }

    getEmailSubject(template:string, emailData:Object):string
    {
        var self = this;
        try
        {
            var subjectTemplate:Function = EmailDelegate.templateCache[template].subjectTemplate;
            return subjectTemplate(emailData);
        }
        catch (err)
        {
            EmailDelegate.logger.error("Couldn't generate email subject for (template %s, data: %s), Error: %s", template, emailData, err);
            throw(err);
        }
    }

    sendAgendaFailedEmailToUser(call:number):q.Promise<any>;
    sendAgendaFailedEmailToUser(call:PhoneCall):q.Promise<any>;
    sendAgendaFailedEmailToUser(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.phoneCallDelegate.get(call, null, [IncludeFlag.INCLUDE_USER]).then(function (fetchedCall:PhoneCall)
            {
                self.sendAgendaFailedEmailToUser(fetchedCall);
            });

        return q.all([
            self.composeAndSend(EmailDelegate.EMAIL_USER_AGENDA_FAIL, call.getUser().getEmail(), {call: call}),
        ]);
    }

    sendSchedulingEmailToExpert(call:number, appointments:number[], duration:number, caller:User):q.Promise<any>;
    sendSchedulingEmailToExpert(call:PhoneCall, appointments:number[], duration:number, caller:User):q.Promise<any>;
    sendSchedulingEmailToExpert(call:any, appointments:number[], duration:number, caller:User):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.phoneCallDelegate.get(call, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER])
                .then(function (fetchedCall:PhoneCall)
            {
                self.sendSchedulingEmailToExpert(fetchedCall, appointments, duration, caller);
            });

        var expert:IntegrationMember = call.getIntegrationMember();
        var integration = new IntegrationDelegate().getSync(expert.getIntegrationId());

        var VerificationCodeDelegate:any = require('../delegates/VerificationCodeDelegate');
        var verificationCodeDelegate = new VerificationCodeDelegate();

        return verificationCodeDelegate.createAppointmentAcceptCode(call,appointments)
            .then(
            function invitationAcceptCodeCreated(code:string)
            {
                var emailData = {
                    call: call,
                    appointments: appointments,
                    integration: integration,
                    acceptCode: code,
                    caller: caller,
                    duration: duration
                };

                return self.composeAndSend(EmailDelegate.EMAIL_EXPERT_SCHEDULING, expert.getUser()[0].getEmail(), emailData);
            });
    }

    sendSchedulingCompleteEmail(call:number, appointment:number):q.Promise<any>;
    sendSchedulingCompleteEmail(call:PhoneCall, appointment:number):q.Promise<any>;
    sendSchedulingCompleteEmail(call:any, appointment:number):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.phoneCallDelegate.get(call, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_USER]).then(function (fetchedCall:PhoneCall)
            {
                self.sendSchedulingCompleteEmail(fetchedCall, appointment);
            });

        var expert:IntegrationMember = call.getIntegrationMember();
        var integration = new IntegrationDelegate().getSync(expert.getIntegrationId());

        var emailData = {
            call: call,
            appointment: appointment,
            integration: integration
        };

        return q.all([
            self.composeAndSend(EmailDelegate.EMAIL_EXPERT_SCHEDULED, expert.getUser()[0].getEmail(), emailData),
            self.composeAndSend(EmailDelegate.EMAIL_USER_SCHEDULED, call.getUser().getEmail(), emailData)
        ]);

    }

    sendReschedulingEmailToUser(call:number, appointment:number):q.Promise<any>;
    sendReschedulingEmailToUser(call:PhoneCall, appointment:number):q.Promise<any>;
    sendReschedulingEmailToUser(call:any, appointment:number):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.phoneCallDelegate.get(call,null, [IncludeFlag.INCLUDE_USER]).then(function (fetchedCall:PhoneCall)
            {
                self.sendReschedulingEmailToUser(fetchedCall, appointment);
            });
        var VerificationCodeDelegate:any = require('../delegates/VerificationCodeDelegate');
        var verificationCodeDelegate = new VerificationCodeDelegate();

        return verificationCodeDelegate.createAppointmentAcceptCode(call)
            .then(
            function invitationAcceptCodeCreated(code:string)
            {
                var emailData = {
                    call: call,
                    acceptCode: code,
                    appointment:appointment
                };

                return q.all([
                    self.composeAndSend(EmailDelegate.EMAIL_USER_RESCHEDULE, call.getUser().getEmail(), emailData)
                ]);
            });

    }

    sendReschedulingEmailToExpert(call:number, appointments:number[]):q.Promise<any>;
    sendReschedulingEmailToExpert(call:PhoneCall, appointments:number[]):q.Promise<any>;
    sendReschedulingEmailToExpert(call:any, appointments:number[]):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.phoneCallDelegate.get(call, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]).then(function (fetchedCall:PhoneCall)
            {
                self.sendReschedulingEmailToExpert(fetchedCall, appointments);
            });

        var VerificationCodeDelegate:any = require('../delegates/VerificationCodeDelegate');
        var verificationCodeDelegate = new VerificationCodeDelegate();

        return verificationCodeDelegate.createAppointmentAcceptCode(call,appointments)
            .then(
            function invitationAcceptCodeCreated(code:string)
            {
                var expert:IntegrationMember = call.getIntegrationMember();
                var integration = new IntegrationDelegate().getSync(expert.getIntegrationId());
                var emailData = {
                    call: call,
                    acceptCode: code,
                    integration: integration,
                    appointments:appointments
                };

                return q.all([
                    self.composeAndSend(EmailDelegate.EMAIL_EXPERT_RESCHEDULE, expert.getUser()[0].getEmail(), emailData)
                ]);
            });
    }

    sendExpertInvitationEmail(integrationId:number, invitationCode:string, recipient:IntegrationMember, sender:User):q.Promise<any>
    {
        var self = this;
        var invitationUrl = ExpertRegistrationUrls.index();
        invitationUrl = url.resolve(Config.get(Config.DASHBOARD_URI), invitationUrl);

        var query = {};
        query[ApiConstants.INTEGRATION_ID] = integrationId;
        query[ApiConstants.CODE] = invitationCode;
        invitationUrl = Utils.addQueryToUrl(invitationUrl, query);

        var integration = new IntegrationDelegate().getSync(integrationId)
        var emailData = {
            integration: integration,
            invitation_url: invitationUrl,
            recipient: recipient.toJson(),
            sender: sender.toJson()
        };
        return self.composeAndSend(EmailDelegate.EMAIL_EXPERT_INVITE, recipient.getUser().getEmail(), emailData, Formatter.formatUserName(sender, true));
    }

    sendWelcomeEmail(integrationId:number, recipient:IntegrationMember):q.Promise<any>
    {
        var integration = new IntegrationDelegate().getSync(integrationId)
        var emailData = {
            integration: integration,
            recipient: recipient.toJson()
        };
        return this.composeAndSend(EmailDelegate.EMAIL_EXPERT_WELCOME, recipient.getUser().getEmail(), emailData);
    }

    sendMobileVerificationReminderEmail(integrationId:number, invitationCode:string, recipient:IntegrationMember):q.Promise<any>
    {
        var invitationUrl = ExpertRegistrationUrls.index();
        invitationUrl = url.resolve(Config.get(Config.DASHBOARD_URI), invitationUrl);

        var query = {};
        query[ApiConstants.INTEGRATION_ID] = integrationId;
        query[ApiConstants.CODE] = invitationCode;
        invitationUrl = Utils.addQueryToUrl(invitationUrl, query);

        var integration = new IntegrationDelegate().getSync(integrationId)

        var emailData = {
            integration: integration,
            invitation_url: invitationUrl,
            recipient: recipient.toJson()
        };
        return this.composeAndSend(EmailDelegate.EMAIL_EXPERT_REMIND_MOBILE_VERIFICATION, recipient.getUser().getEmail(), emailData);
    }

    sendPaymentCompleteEmail():q.Promise<any>
    {
        return null;
    }

    sendCallReminderEmail(call:number):q.Promise<any>;
    sendCallReminderEmail(call:PhoneCall):q.Promise<any>;
    sendCallReminderEmail(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.phoneCallDelegate.get(call, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_USER]).then(function (fetchedCall:PhoneCall)
            {
                self.sendCallReminderEmail(fetchedCall);
            });

        return q.all([
            self.composeAndSend(EmailDelegate.EMAIL_USER_REMINDER, call.getUser().getEmail(), {call: call}),
            self.composeAndSend(EmailDelegate.EMAIL_EXPERT_REMINDER, call.getIntegrationMember().getUser()[0].getEmail(), {call: call})
        ]);
    }

    sendCallFailureEmail(call:number):q.Promise<any>;
    sendCallFailureEmail(call:PhoneCall):q.Promise<any>;
    sendCallFailureEmail(call:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(call) == 'Number')
            return self.phoneCallDelegate.get(call).then(self.sendCallFailureEmail);

        return null;
    }

    sendAccountVerificationEmail(user:User, verificationCode:string):q.Promise<any>
    {
        var verificationUrl = url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.emailAccountVerification());

        var query = {};
        query[ApiConstants.CODE] = verificationCode;
        query[ApiConstants.EMAIL] = user.getEmail();
        verificationUrl = Utils.addQueryToUrl(verificationUrl, query);

        var emailData = {
            code: verificationCode,
            verificationUrl: verificationUrl
        };

        return this.composeAndSend(EmailDelegate.EMAIL_ACCOUNT_VERIFICATION, user.getEmail(), emailData);
    }

    sendPasswordResetEmail(email:string, code:string):q.Promise<any>
    {
        var passwordResetUrl = url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.forgotPassword());

        var query = {};
        query[ApiConstants.CODE] = code;
        passwordResetUrl = Utils.addQueryToUrl(passwordResetUrl, query);

        var emailData = {
            passwordResetUrl: passwordResetUrl
        };

        return this.composeAndSend(EmailDelegate.EMAIL_PASSWORD_RESET, email, emailData);
    }

    sendProfilePendingApprovalEmail(memberId:number):q.Promise<any>
    {
        var self = this;
        var integrationId:number;
        var user:User;

        return self.integrationMemberDelegate.get(memberId)
            .then( function memberFetched(integrationMember:IntegrationMember)
            {
                integrationId = integrationMember.getIntegrationId();
                return q.all([
                    self.integrationMemberDelegate.find({integration_id:integrationId, 'role':IntegrationMemberRole.Owner}),
                    self.userDelegate.get(integrationMember.getUserId())
                ])
            })
            .then( function ownerFetched(...args)
            {
                var owner:IntegrationMember = args[0][0];
                user = args[0][1];
                return self.userDelegate.get(owner.getUserId())
            })
            .then( function ownerUserFetched(ownerUser:User)
            {
                var integration = new IntegrationDelegate().getSync(integrationId);
                var email = ownerUser.getEmail();
                var emailData = {
                    expert :user,
                    integration:integration,
                    memberId:memberId
                };
                return self.composeAndSend(EmailDelegate.EMAIL_PROFILE_PENDING_APPROVAL, 'ankit.agarwal@infollion.com', emailData);
            })
    }

}
export = EmailDelegate