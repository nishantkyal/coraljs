///<reference path='../../_references.d.ts'/>
import q                                                = require('q');
import _                                                = require('underscore');
import passport                                         = require('passport');
import connect_ensure_login                             = require('connect-ensure-login');
import express                                          = require('express');
import log4js                                           = require('log4js');
import accounting                                       = require('accounting');
import ApiUrlDelegate                                   = require('../../delegates/ApiUrlDelegate');
import AuthenticationDelegate                           = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                     = require('../../delegates/UserDelegate');
import IntegrationMemberDelegate                        = require('../../delegates/IntegrationMemberDelegate');
import EmailDelegate                                    = require('../../delegates/EmailDelegate');
import SMSDelegate                                      = require('../../delegates/SMSDelegate');
import MoneyUnit                                        = require('../../enums/MoneyUnit');
import IncludeFlag                                      = require('../../enums/IncludeFlag');
import User                                             = require('../../models/User');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import SMS                                              = require('../../models/SMS');
import IntegrationMemberRole                            = require('../../enums/IntegrationMemberRole');
import ApiConstants                                     = require('../../enums/ApiConstants');
import SmsTemplate                                      = require('../../enums/SmsTemplate');
import Utils                                            = require('../../common/Utils');
import Formatter                                        = require('../../common/Formatter');
import VerificationCodeCache                            = require('../../caches/VerificationCodeCache');
import Middleware                                       = require('./Middleware');
class DashboardRoute
{
    static PAGE_LOGIN:string = 'dashboard/login';
    static PAGE_INTEGRATIONS:string = 'dashboard/integrations';
    static PAGE_USERS:string = 'dashboard/integrationUsers';
    static PAGE_PROFILE:string = 'dashboard/memberProfile';

    integrationMemberDelegate = new IntegrationMemberDelegate();
    userDelegate = new UserDelegate();
    emailDelegate = new EmailDelegate();
    verificationCodeCache = new VerificationCodeCache();

    constructor(app)
    {
        // Pages
        app.get('/', connect_ensure_login.ensureLoggedIn(), this.authSuccess.bind(this));
        app.get('/login', this.login.bind(this));
        app.get('/integrations', connect_ensure_login.ensureLoggedIn(), this.integrations.bind(this));
        app.get('/integration/:integrationId/users', Middleware.allowOwnerOrAdmin, this.integrationUsers.bind(this));
        app.get('/member/:memberId/profile', Middleware.allowSelf, this.memberProfile.bind(this));

        // Auth
        app.post('/login', passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: '/login'}), this.authSuccess.bind(this));
        app.post('/member/:memberId/profile', Middleware.allowSelf, this.memberProfileSave.bind(this));
    }

    login(req:express.Request, res:express.Response)
    {
        res.render(DashboardRoute.PAGE_LOGIN, {logged_in_user: req['user']});
    }

    authSuccess(req:express.Request, res:express.Response)
    {
        var user = req['user'];

        this.integrationMemberDelegate.searchByUser(user.id, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers)
            {
                Middleware.setIntegrationMembers(req, integrationMembers);

                if (integrationMembers.length > 1)
                    res.redirect('/integrations');
                else
                {
                    var integrationMember = new IntegrationMember(integrationMembers[0]);
                    var integration:Integration = new Integration(integrationMember.getIntegration()[0]); // TODO: Implement foreign keys correctly in search so [0] goofiness is not required for 1-to-1 relationships
                    req.session[ApiConstants.INTEGRATION_ID] = integration.getId();

                    if (integrationMember.getRole() === IntegrationMemberRole.Admin || integrationMember.getRole() == IntegrationMemberRole.Owner)
                        res.redirect('/integration/' + integration.getId() + '/users');
                    else
                        res.redirect('/expert/' + integrationMember.getId() + '/profile');
                }

            },
            function integrationsFetchError(error) { res.send(500); });
    }

    integrations(req:express.Request, res:express.Response)
    {
        var user = req['user'];

        this.integrationMemberDelegate.searchByUser(user.id, this.integrationMemberDelegate.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers)
            {
                Middleware.setIntegrationMembers(req, integrationMembers);

                // TODO: Clean up data because we havent implemented foreign keys correctly
                _.each(integrationMembers, function (member:IntegrationMember)
                {
                    var users:User[] = member[IntegrationMember.USER];
                    var integrations:Integration[] = member[IntegrationMember.INTEGRATION];
                    member.setUser(_.findWhere(users, {'id': member.getUserId()}));
                    member.setIntegration(_.findWhere(integrations, {'id': member.getIntegrationId()}));
                });

                var pageData =
                {
                    'members': integrationMembers,
                    'logged_in_user': req['user']
                };

                res.render(DashboardRoute.PAGE_INTEGRATIONS, pageData);
            },
            function integrationsFetchError(error)
            {
                res.send(500, error);
            });
    }

    integrationUsers(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        req.session[ApiConstants.INTEGRATION_ID] = integrationId;

        var integrationMembers = Middleware.getIntegrationMembers(req);

        Middleware.setIntegrationId(req, integrationId);

        var member = _.findWhere(integrationMembers, {'integration_id': integrationId});
        var integration = member[IntegrationMember.INTEGRATION];

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
                var invitedMembers = [].concat(results[0][1]);

                members = members.concat(_.map(invitedMembers, function(invited) { return new IntegrationMember(invited); } ));
                _.each(members, function (member:IntegrationMember) {
                    if (Utils.getObjectType(member[IntegrationMember.USER]) == 'Array')
                        // TODO: Implement foreign keys to get rid if this goofiness
                        member[IntegrationMember.USER] = _.findWhere(member[IntegrationMember.USER], {id: member.getUserId()});
                });

                var pageData =
                {
                    'logged_in_user': req['user'],
                    'integrationMembers': members,
                    'integration': integration
                };
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(DashboardRoute.PAGE_USERS, pageData);
            },
            function usersFetchError(error) { res.send(500, error); });
    }

    memberProfile(req:express.Request, res:express.Response)
    {
        var user = req[ApiConstants.USER];
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integrationMembers = Middleware.getIntegrationMembers(req);
        var member = new IntegrationMember(_.findWhere(integrationMembers, {'user_id': user.id, 'integration_id': integrationId}));

        Middleware.setIntegrationId(req, member.getIntegrationId());

        this.userDelegate.get(user.id)
            .then(
                function userFetched(user)
                {
                    var pageData =
                    {
                        'logged_in_user': req['user'],
                        'member': member,
                        'user': user
                    };
                    res.render(DashboardRoute.PAGE_PROFILE, pageData);
                },
                function userFetchError() { res.send(500); }
            );
    }

    memberProfileSave(req:express.Request, res:express.Response)
    {
        var loggedInUser = req['user'];
        var user = req.body[ApiConstants.USER];

        this.userDelegate.update({id: loggedInUser.id}, user)
            .then(
                function userUpdated() { res.send(200); },
                function userUpdateError() { res.send(500); }
            );
    }
}

export = DashboardRoute