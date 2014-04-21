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
import ApiUrlDelegate                                               = require('../delegates/ApiUrlDelegate');
import UserDelegate                                                 = require('../delegates/UserDelegate');
import IntegrationDelegate                                          = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                                    = require('../delegates/IntegrationMemberDelegate');
import VerificationCodeDelegate                                     = require('../delegates/VerificationCodeDelegate');
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
    private static EMAIL_EXPERT_INVITE:string = 'EMAIL_EXPERT_INVITE';
    private static EMAIL_EXPERT_WELCOME:string = 'EMAIL_EXPERT_WELCOME';
    private static EMAIL_EXPERT_REMIND_MOBILE_VERIFICATION:string = 'EMAIL_EXPERT_REMIND_MOBILE_VERIFICATION';
    private static EMAIL_EXPERT_SCHEDULING:string = 'EMAIL_EXPERT_SCHEDULING';
    private static EMAIL_EXPERT_SCHEDULED:string = 'EMAIL_EXPERT_SCHEDULED';
    private static EMAIL_EXPERT_REMINDER:string = 'EMAIL_EXPERT_REMINDER';
    private static EMAIL_ACCOUNT_VERIFICATION:string = 'EMAIL_ACCOUNT_VERIFICATION';
    private static EMAIL_USER_REMINDER:string = 'EMAIL_USER_REMINDER';
    private static EMAIL_USER_SCHEDULED:string = 'EMAIL_USER_SCHEDULED';
    private static EMAIL_USER_AGENDA_FAIL:string = 'EMAIL_USER_AGENDA_FAIL';
    // TODO: Implement this
    private static EMAIL_USER_ACCOUNT_INCOMPLETE_REMINDER:string = 'EMAIL_USER_ACCOUNT_INCOMPLETE_REMINDER';

    private static templateCache:{[templateNameAndLocale:string]:{bodyTemplate:Function; subjectTemplate:Function}} = {};
    private static transport:nodemailer.Transport;
    private phoneCallDelegate = new PhoneCallDelegate();
    private static logger:log4js.Logger = log4js.getLogger('EmailDelegate');

    constructor()
    {
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
        watch.createMonitor('/var/searchntalk/emailTemplates',
            {
                filter: function (file)
                {
                    return file.substring(file.lastIndexOf('.') + 1) === 'html';
                }
            },
            function monitorCreated(monitor)
            {
                function readFileAndCache(filePath)
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

                _.each(monitor.files, function (data, fileName) { readFileAndCache(fileName); });

                monitor.on("created", function (f, stat) { readFileAndCache(f); });
                monitor.on("changed", function (f, curr, prev) { readFileAndCache(f); });
                monitor.on("removed", function (f, stat)
                {
                    // TODO: Remove from template cache
                });
            });
    })();

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
            EmailDelegate.logger.error("Couldn't generate email body for (template %s, data: %s), Error: %s", template, emailData, err);
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
            return self.phoneCallDelegate.get(call,null, [IncludeFlag.INCLUDE_USER]).then(function (fetchedCall:PhoneCall){
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
            return self.phoneCallDelegate.get(call).then(function (fetchedCall:PhoneCall)
            {
                self.sendSchedulingEmailToExpert(fetchedCall, appointments, duration, caller);
            });

        var expert:IntegrationMember = call.getIntegrationMember();
        var integration = new IntegrationDelegate().getSync(expert.getIntegrationId());

        var VerificationCodeDelegate:any = require('../delegates/VerificationCodeDelegate');
        var verificationCodeDelegate = new VerificationCodeDelegate();

        return verificationCodeDelegate.createAppointmentAcceptCode(call)
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
            return self.phoneCallDelegate.get(call,null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_USER]).then(function (fetchedCall:PhoneCall)
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

    sendExpertInvitationEmail(integrationId:number, invitationCode:string, recipient:IntegrationMember, sender:User):q.Promise<any>
    {
        var self = this;
        var invitationUrl = ExpertRegistrationUrls.index();
        invitationUrl += '?';
        invitationUrl += ApiConstants.INTEGRATION_ID + '=' + integrationId;
        invitationUrl += '&';
        invitationUrl += ApiConstants.CODE + '=' + invitationCode;
        invitationUrl = url.resolve(Config.get(Config.DASHBOARD_URI), invitationUrl);

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
        invitationUrl += '?';
        invitationUrl += ApiConstants.INTEGRATION_ID + '=' + integrationId;
        invitationUrl += '&';
        invitationUrl += ApiConstants.CODE + '=' + invitationCode;
        invitationUrl = url.resolve(Config.get(Config.DASHBOARD_URI), invitationUrl);

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
            return self.phoneCallDelegate.get(call,null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_USER]).then(function (fetchedCall:PhoneCall)
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
        verificationUrl += '?';
        verificationUrl += ApiConstants.CODE + '=' + verificationCode;
        verificationUrl += '&';
        verificationUrl += ApiConstants.EMAIL + '=' + user.getEmail();

        var emailData = {
            code: verificationCode,
            verificationUrl: verificationUrl
        };

        return this.composeAndSend(EmailDelegate.EMAIL_ACCOUNT_VERIFICATION, user.getEmail(), emailData);
    }
}
export = EmailDelegate