///<reference path='../../_references.d.ts'/>
import q                                                = require('q');
import _                                                = require('underscore');
import passport                                         = require('passport');
import connect_ensure_login                             = require('connect-ensure-login');
import express                                          = require('express');
import log4js                                           = require('log4js');
import ApiUrlDelegate                                   = require('../../delegates/ApiUrlDelegate');
import AuthenticationDelegate                           = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                     = require('../../delegates/UserDelegate');
import IntegrationMemberDelegate                        = require('../../delegates/IntegrationMemberDelegate');
import EmailDelegate                                    = require('../../delegates/EmailDelegate');
import SMSDelegate                                      = require('../../delegates/SMSDelegate');
import IncludeFlag                                      = require('../../enums/IncludeFlag');
import User                                             = require('../../models/User');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import SMS                                              = require('../../models/SMS');
import IntegrationMemberRole                            = require('../../enums/IntegrationMemberRole');
import ApiConstants                                     = require('../../enums/ApiConstants');
import SmsTemplate                                      = require('../../enums/SmsTemplate');
import Utils                                            = require('../../common/Utils');
import VerificationCodeCache                            = require('../../caches/VerificationCodeCache');

class DashboardRoute
{
    static PAGE_LOGIN:string = 'dashboard/login';
    static PAGE_INTEGRATIONS:string = 'dashboard/integrations';
    static PAGE_USERS:string = 'dashboard/integrationUsers';
    static PAGE_PROFILE:string = 'dashboard/expertProfile';

    integrationMemberDelegate = new IntegrationMemberDelegate();
    userDelegate = new UserDelegate();
    emailDelegate = new EmailDelegate();
    verificationCodeCache = new VerificationCodeCache();

    constructor(app)
    {
        // Pages
        app.get('/', connect_ensure_login.ensureLoggedIn(), this.authSuccess.bind(this));
        app.get('/login', this.login.bind(this));
        app.get('/integration/:integrationId/users', DashboardRouteMiddleware.allowOwnerOrAdmin, this.integrationUsers.bind(this));
        app.get('/expert/:expertId/profile', DashboardRouteMiddleware.allowSelf, this.expertProfile.bind(this));

        // Auth
        app.post('/login', passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: '/login'}), this.authSuccess.bind(this));
    }

    login(req:express.Request, res:express.Response)
    {
        res.render(DashboardRoute.PAGE_LOGIN, {logged_in_user: req['user']});
    }

    authSuccess(req:express.Request, res:express.Response)
    {
        var user = req['user'];

        this.integrationMemberDelegate.searchByUser(user.id, null, [IncludeFlag.INCLUDE_INTEGRATION])
            .then(
            function integrationsFetched(integrationMembers)
            {
                DashboardRouteMiddleware.setIntegrationMembers(req, integrationMembers);

                // If more than one result, display list
                // else redirect to users' list or expert profile based on role
                if (integrationMembers.length > 1)
                {
                    var pageData = {
                        'integrations': [],
                        'logged_in_user': req['user']
                    };

                    pageData['integrations'] = _.pluck(integrationMembers, IntegrationMember.INTEGRATION);

                    res.render(DashboardRoute.PAGE_INTEGRATIONS, pageData);
                }
                else
                {
                    var integrationMember = new IntegrationMember(integrationMembers[0]);
                    var integration:Integration = new Integration(integrationMember.getIntegration()[0]); // TODO: Implement foreign keys correctly in search so [0] goofiness is not required for 1-to-1 relationships

                    if (integrationMember.getRole() === IntegrationMemberRole.Admin || integrationMember.getRole() == IntegrationMemberRole.Owner)
                        res.redirect('/integration/' + integration.getId() + '/users');
                    else
                        res.redirect('/expert/' + integrationMember.getId() + '/profile');
                }

            },
            function integrationsFetchError(error)
            {
                res.send(500, error);
            });
    }

    integrationUsers(req:express.Request, res:express.Response)
    {
        // Get details for current integration
        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        var integrationMembers = DashboardRouteMiddleware.getIntegrationMembers(req);

        DashboardRouteMiddleware.setIntegrationId(req, integrationId);

        var member = _.map(integrationMembers, function (member)
        {
            return member['integration_id'] === integrationId ? member : null;
        });
        var integration = member[0][IncludeFlag.INCLUDE_INTEGRATION][0];

        // Fetch all users for integration
        var search = {};
        search[IntegrationMember.INTEGRATION_ID] = integrationId;

        q.all([
                this.integrationMemberDelegate.search(search, null, this.integrationMemberDelegate.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]),
                this.verificationCodeCache.getInvitationCodes(integrationId)
            ])
            .then(
            function membersFetched(...results)
            {
                var members = results[0][0];
                var invitedMembers = results[0][1];

                _.each(members, function (member)
                {
                    member['role'] = IntegrationMemberRole[member['role']];
                });

                var pageData =
                {
                    'logged_in_user': req['user'],
                    'integrationMembers': members,
                    'integration': integration
                };
                res.render(DashboardRoute.PAGE_USERS, pageData);
            },
            function usersFetchError(error) { res.send(500, error); });
    }

    expertProfile(req:express.Request, res:express.Response)
    {
        var user = req['user'];
        var integrationMembers = DashboardRouteMiddleware.getIntegrationMembers(req);
        var member = new IntegrationMember(_.map(integrationMembers, function (member)
        {
            return member['user_id'] === user.id ? member : null;
        })[0]);

        DashboardRouteMiddleware.setIntegrationId(req, member.getIntegrationId());

        var pageData =
        {
            'logged_in_user': req['user'],
            'member': member,
            'user': member[IncludeFlag.INCLUDE_USER][0]
        };
        res.render(DashboardRoute.PAGE_PROFILE, pageData);
    }

    deleteMember(req:express.Request, res:express.Response)
    {
        var memberId = req.params[ApiConstants.EXPERT_ID];
        this.integrationMemberDelegate.delete(memberId)
            .then(
            function deleteSuccess() { res.send(200); },
            function deleteFailed(error) { res.send(500, error); }
        );
    }

    saveMember(req:express.Request, res:express.Response)
    {
        var expertId = req.params[ApiConstants.EXPERT_ID];
        var newUser = req.body[ApiConstants.USER];
        newUser.setId(null);
        var user:User = new User(_.extend(req['user'], newUser.toJson()));

        this.userDelegate.update({id: user.getId()}, user.toJson())
            .then(
            function userUpdated() { res.redirect('/expert/' + expertId + '/profile'); },
            function userUpdateError(error) { res.send(500, error); }
        )
    }

    inviteMember(req:express.Request, res:express.Response)
    {
        var user:User = req.body[ApiConstants.USER];
        var role = req.body['role'];
        var integrationId = DashboardRouteMiddleware.getIntegrationId(req);

        this.emailDelegate.sendExpertInvitationEmail(integrationId, user)
            .then(
            function emailSent() { res.send(200); },
            function emailSendError(error) { res.send(500, error); }
        );
    }

    generateMobileVerificationCode(req:express.Request, res:express.Response)
    {
        var phone:number = req.body['mobile'];
        var countryCode:string = req.body['countryCode'];
        var codeRef:string;

        this.verificationCodeCache.createMobileVerificationCode()
            .then(
            function codeGenerated(result)
            {
                var smsDelegate = new SMSDelegate();

                var sms = new SMS();
                sms.setPhone(phone);
                sms.setCountryCode(countryCode);
                sms.setMessage(smsDelegate.generateSMSText(SmsTemplate.VERIFY_NUMBER, {code: result['code']}));

                return smsDelegate.send(sms);
            })
            .then(
            function smsSent() { res.send(codeRef); },
            function smsSendFailed() { res.send(codeRef); }
        );
    }

    verifyMobileCode(req:express.Request, res:express.Response)
    {
        var code = req.query[ApiConstants.CODE];
        var ref = req.query[ApiConstants.CODE_VERIFICATION];

        this.verificationCodeCache.searchMobileVerificationCode(code, ref)
            .then(
            function codeVerified(result) { res.send(result); },
            function codeVerifyError(err) { res.send(500); }
        )
    }
}

class DashboardRouteMiddleware
{
    private static SESSION_INTEGRATION_MEMBERS:string = 'integration_members';
    private static SESSION_INTEGRATION_ID:string = 'integration_id';

    static setIntegrationMembers(req, integrationMembers:any):void { req.session[DashboardRouteMiddleware.SESSION_INTEGRATION_MEMBERS] = integrationMembers; }

    static getIntegrationMembers(req):any { return req.session[DashboardRouteMiddleware.SESSION_INTEGRATION_MEMBERS]; }

    static setIntegrationId(req, integrationId:number):void { req.session[DashboardRouteMiddleware.SESSION_INTEGRATION_ID] = integrationId; }

    static getIntegrationId(req):any { return req.session[DashboardRouteMiddleware.SESSION_INTEGRATION_ID]; }

    static allowOwnerOrAdmin(req:express.Request, res:express.Response, next:Function)
    {
        var integrationMembers = DashboardRouteMiddleware.getIntegrationMembers(req);
        var integrationId:number = parseInt(req.params[ApiConstants.INTEGRATION_ID]);

        var isAdmin = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Admin}));
        var isOwner = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Owner}));

        if (isAdmin || isOwner)
            next();
        else
        // TODO: Change to error flash and then redirect
            res.redirect('/login');
    }

    static allowExpert(req:express.Request, res:express.Response, next:Function)
    {
        var integrationMembers = DashboardRouteMiddleware.getIntegrationMembers(req);
        var expertId:number = parseInt(req.params[ApiConstants.EXPERT_ID]);

        var isValidExpert = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'id': expertId, 'role': IntegrationMemberRole.Expert}));

        if (isValidExpert)
            next();
        else
            res.redirect('/login');
    }

    static allowSelf(req:express.Request, res:express.Response, next:Function)
    {
        var integrationMembers = DashboardRouteMiddleware.getIntegrationMembers(req);
        var expertId:number = parseInt(req.params[ApiConstants.EXPERT_ID]);

        var isSelf = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'id': expertId}));

        if (isSelf)
            next();
        else
            res.redirect('/login');
    }
}

export = DashboardRoute