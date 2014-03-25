///<reference path='../_references.d.ts'/>
import url                                                          = require('url');
import cheerio                                                      = require('cheerio');
import fs                                                           = require('fs');
import log4js                                                       = require('log4js');
import path                                                         = require('path');
import _                                                            = require('underscore');
import q                                                            = require('q');
import nodemailer                                                   = require('nodemailer');
import watch                                                        = require('watch');
import Email                                                        = require('../models/Email')
import User                                                         = require('../models/User')
import Integration                                                  = require('../models/Integration')
import IntegrationMember                                            = require('../models/IntegrationMember')
import IDao                                                         = require('../dao/IDao');
import ApiConstants                                                 = require('../enums/ApiConstants');
import CallStatus                                                   = require('../enums/CallStatus');
import IncludeFlag                                                  = require('../enums/IncludeFlag');
import ApiUrlDelegate                                               = require('../delegates/ApiUrlDelegate');
import UserDelegate                                                 = require('../delegates/UserDelegate');
import IntegrationDelegate                                          = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                                    = require('../delegates/IntegrationMemberDelegate');
import Utils                                                        = require('../common/Utils');
import Config                                                       = require('../common/Config');
import VerificationCodeCache                                        = require('../caches/VerificationCodeCache');
import ExpertRegistrationUrls                                       = require('../routes/expertRegistration/Urls');

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

    private static templateCache:{[templateNameAndLocale:string]:{bodyTemplate:Function; subjectTemplate:Function}} = {};
    private static transport:nodemailer.Transport;

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
                            log4js.getDefaultLogger().debug('Email template updated: ' + fileNameWithoutExtension.toUpperCase());
                        }
                    });
                }

                _.each(monitor.files, function (data, fileName)
                {
                    readFileAndCache(fileName);
                });

                monitor.on("created", function (f, stat)
                {
                    readFileAndCache(f);
                });
                monitor.on("changed", function (f, curr, prev)
                {
                    readFileAndCache(f);
                });
                monitor.on("removed", function (f, stat)
                {
                    // TODO: Remove from template cache
                });
            });
    })();

    private send(template:string, to:string, emailData:Object, replyTo?:string, from:string = 'contact@searchntalk.com'):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer<any>();

        var bodyTemplate:Function = EmailDelegate.templateCache[template].bodyTemplate;
        var subjectTemplate:Function = EmailDelegate.templateCache[template].subjectTemplate;

        emailData["email_cdn_base_uri"] = Config.get(Config.EMAIL_CDN_BASE_URI);
        replyTo = replyTo || from;

        try
        {
            var body:string = bodyTemplate(emailData);
            var subject:string = subjectTemplate(emailData);
        } catch (e)
        {
            log4js.getLogger(Utils.getClassName(self)).error('Invalid email template: ' + template);
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
            function emailSent(error:Error, response:any):any
            {
                if (error)
                    deferred.reject(error);
                else
                    deferred.resolve(response);
            }
        );

        return deferred.promise;
    }

    sendCallStatusUpdateNotifications(callerUserId:number, expertId:number, status:CallStatus):q.Promise<any>
    {
        var self = this;

        // 1. Get expert's user id
        // 2. Get emails for caller and expert
        // 3. Send emails
        return new IntegrationMemberDelegate().get(expertId, ['user_id'])
            .then(
            function expertUserIdFetched(expert:IntegrationMember)
            {
                return new UserDelegate().search({'id': [expert['user_id'], callerUserId]}, null, ['email']);
            })
            .then(
            function emailsFetched(users:Array<User>)
            {
                var expertEmail, callerEmail;
                _.each(users, function (user:User)
                {
                    if (user.getId() == callerUserId)
                        callerEmail = user.getEmail();
                    else
                        expertEmail = user.getEmail();
                });

                switch (status)
                {
                    // TODO: Implement all call status emails
                    case CallStatus.POSTPONED:
                        return q.all([
                        ]);
                        break;
                }

                return null;
            });
    }

    sendExpertInvitationEmail(integrationId:number, invitationCode:string, recipient:IntegrationMember, sender:User):q.Promise<any>
    {
        var self = this;
        var invitationUrl = ExpertRegistrationUrls.index();
        invitationUrl += '?';
        invitationUrl += ApiConstants.INTEGRATION_ID + '=' + integrationId;
        invitationUrl += '&';
        invitationUrl += ApiConstants.CODE + '=' + invitationCode;
        invitationUrl = url.resolve(Config.get(Config.CORAL_URI), invitationUrl);

        var integration = new IntegrationDelegate().getSync(integrationId)
        var emailData = {
            integration: integration,
            invitation_url: invitationUrl,
            recipient: recipient.toJson(),
            sender: sender.toJson()
        };
        return self.send(EmailDelegate.EMAIL_EXPERT_INVITE, recipient.getUser().getEmail(), emailData, sender.getEmail());
    }

    sendWelcomeEmail(integrationId:number, recipient:IntegrationMember):q.Promise<any>
    {
        var integration = new IntegrationDelegate().getSync(integrationId)
        var emailData = {
            integration: integration,
            recipient: recipient.toJson()
        };
        return this.send(EmailDelegate.EMAIL_EXPERT_WELCOME, recipient.getUser().getEmail(), emailData);
    }

    sendMobileVerificationReminderEmail(integrationId:number, invitationCode:string, recipient:IntegrationMember):q.Promise<any>
    {
        var invitationUrl = ExpertRegistrationUrls.index();
        invitationUrl += '?';
        invitationUrl += ApiConstants.INTEGRATION_ID + '=' + integrationId;
        invitationUrl += '&';
        invitationUrl += ApiConstants.CODE + '=' + invitationCode;
        invitationUrl = url.resolve(Config.get(Config.CORAL_URI), invitationUrl);

        var integration = new IntegrationDelegate().getSync(integrationId)

        var emailData = {
            integration: integration,
            invitation_url: invitationUrl,
            recipient: recipient.toJson()
        };
        return this.send(EmailDelegate.EMAIL_EXPERT_REMIND_MOBILE_VERIFICATION, recipient.getUser().getEmail(), emailData);
    }

}
export = EmailDelegate