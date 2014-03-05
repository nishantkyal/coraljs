///<reference path='../_references.d.ts'/>
import fs                           = require('fs');
import log4js                       = require('log4js');
import path                         = require('path');
import _                            = require('underscore');
import q                            = require('q');
import nodemailer                   = require('nodemailer');
import watch                        = require('watch');
import Email                        = require('../models/Email')
import User                         = require('../models/User')
import Integration                  = require('../models/Integration')
import IntegrationMember            = require('../models/IntegrationMember')
import IDao                         = require('../dao/IDao');
import EmailDao                     = require('../dao/EmailDao');
import CallStatus                   = require('../enums/CallStatus');
import IncludeFlag                  = require('../enums/IncludeFlag');
import UserDelegate                 = require('../delegates/UserDelegate');
import IntegrationDelegate          = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import Utils                        = require('../common/Utils');
import Config                       = require('../common/Config');
import VerificationCodeCache        = require('../caches/VerificationCodeCache');

/*
 Delegate class for managing email
 1. Queue new email
 2. Check status of emails
 3. Search emails
 */
class EmailDelegate
{
    static EMAIL_EXPERT_INVITE:string = 'EMAIL_EXPERT_INVITE';

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
                                'subjectTemplate': function () { return "Test email: " + Utils.getRandomInt(1000, 9999); }
                            };
                            log4js.getDefaultLogger().debug('Email templated updated: ' + fileNameWithoutExtension.toUpperCase());
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

    getDao():IDao { return new EmailDao(); }

    private send(template:string, to:string, emailData:Object, from:string = 'contact@searchntalk.com'):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer<any>();

        var bodyTemplate:Function = EmailDelegate.templateCache[template].bodyTemplate;
        var subjectTemplate:Function = EmailDelegate.templateCache[template].subjectTemplate;

        emailData["emailcdnhost"] = Config.get("email.cdn.host");

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
                subject: subject,
                html: body
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
                return new UserDelegate().search({'id': [expert['user_id'], callerUserId]}, ['email']);
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

    sendExpertInvitationEmail(integrationId:number, user:User):q.Promise<any>
    {
        var self = this;

        return q.all([
                new IntegrationDelegate().get(integrationId, [Integration.TITLE]),
                new VerificationCodeCache().createInvitationCode(integrationId, user)
            ])
            .then(
            function codeCreated(...args)
            {
                var emailData = {
                    integration: args[0][0],
                    code: args[0][1],
                    user: user.toJson()
                };
                return self.send(EmailDelegate.EMAIL_EXPERT_INVITE, user.getEmail(), emailData);
            });
    }

}
export = EmailDelegate