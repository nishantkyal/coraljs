///<reference path='../../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import passport                                             = require('passport');
import connect_ensure_login                                 = require('connect-ensure-login');
import url                                                  = require('url');
import RequestHandler                                       = require('../../middleware/RequestHandler');
import OAuthProviderDelegate                                = require('../../delegates/OAuthProviderDelegate');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                         = require('../../delegates/UserDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import VerificationCodeCache                                = require('../../caches/VerificationCodeCache');
import IntegrationDelegate                                  = require('../../delegates/IntegrationDelegate');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import Integration                                          = require('../../models/Integration');
import User                                                 = require('../../models/User');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IntegrationType                                      = require('../../enums/IntegrationType');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import Config                                               = require('../../common/Config');
import Utils                                                = require('../../common/Utils');

import Urls                                                 = require('./Urls');
import Middleware                                           = require('./Middleware');

class ExpertRegistrationRoute
{
    userDelegate = new UserDelegate();
    integrationMemberDelegate = new IntegrationMemberDelegate();
    verificationCodeCache = new VerificationCodeCache();
    emailDelegate = new EmailDelegate();

    constructor(app)
    {
        // Pages
        app.get(Urls.index(), this.authenticate.bind(this));
        app.get(Urls.authorization(), OAuthProviderDelegate.authorization, this.authorize.bind(this));
        app.get(Urls.mobileVerification(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.index()}), this.mobileVerification.bind(this));
        app.get(Urls.profile(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.index()}), this.updateProfile.bind(this));
        app.get(Urls.complete(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.index()}), this.expertComplete.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: Urls.index(), failureFlash: true}), this.authenticationSuccess.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register({failureRedirect: Urls.index(), failureFlash: true}), this.authenticationSuccess.bind(this));
        app.get(Urls.linkedInLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {failureRedirect: Urls.index(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));
        app.get(Urls.linkedInLoginCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {failureRedirect: Urls.index(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}), this.authenticationSuccess.bind(this));
        app.post(Urls.authorizationDecision(), OAuthProviderDelegate.decision);

        app.post(Urls.profile(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.index()}), this.saveProfile.bind(this));
    }

    /* Render login/register page */
    private authenticate(req:express.Request, res:express.Response):void
    {
        var self = this;
        var integrationId = parseInt(req.query[ApiConstants.INTEGRATION_ID] || req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationDelegate().getSync(integrationId);
        var invitationCode:string = req.query[ApiConstants.CODE] || req.session[ApiConstants.CODE];
        var invitedMember;

        if (Utils.isNullOrEmpty(integration))
        {
            res.send(404, 'The integration id was not found');
            return;
        }

        // Add invitation code and integration id to session
        req.session[ApiConstants.INTEGRATION_ID] = integrationId;
        req.session[ApiConstants.CODE] = invitationCode;

        this.verificationCodeCache.searchInvitationCode(invitationCode, integrationId)
            .then(
            function verified(result):any
            {
                invitedMember = new IntegrationMember(result);
                var invitedMemberEmail = invitedMember.getUser()[User.EMAIL];
                return self.integrationMemberDelegate.findByEmail(invitedMemberEmail, integrationId)
            },
            function verificationFailed() { throw("The invitation is either invalid or has expired"); }
        )
            .then(
            function expertFound(expert:IntegrationMember)
            {
                if (expert.isValid())
                {
                    req.session[ApiConstants.EXPERT] = expert;
                    res.redirect(Urls.profile());
                }
                else
                {
                    var member = new IntegrationMember(invitedMember);
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.render('expertRegistration/authenticate', {'integration': integration, messages: req.flash(), member: member, user: member.getUser(), code: invitationCode});
                }
            })
            .fail(
            function handleError(error) { res.send(500, error); }
        );
    }


    /* Handle authentication success -> Redirect to authorization */
    private authenticationSuccess(req:express.Request, res:express.Response)
    {
        var integrationId = req.session[ApiConstants.INTEGRATION_ID];
        var integration = new IntegrationDelegate().getSync(integrationId);
        var redirectUrl = integration.getIntegrationType() == IntegrationType.SHOP_IN_SHOP ? url.resolve(Config.get(Config.CORAL_URI), Urls.profile()) : integration.getRedirectUrl();

        var authorizationUrl = Urls.authorization() + '?response_type=code&client_id=' + integrationId + '&redirect_uri=' + redirectUrl;
        res.redirect(authorizationUrl);
    }

    /* Render authorization page */
    private authorize(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.query[ApiConstants.INTEGRATION_ID] || req.session[ApiConstants.INTEGRATION_ID]);
        res.render('expertRegistration/authorize',
            {
                'transactionID': req['oauth2']['transactionID'],
                'user': new User(req.user.data),
                'integration': new IntegrationDelegate().getSync(integrationId)
            });
    }

    private updateProfile(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationDelegate().getSync(integrationId);

        this.userDelegate.get(req[ApiConstants.USER].id)
            .then(
            function userFetched(user)
            {
                var pageData = {
                    integration: integration,
                    user: user
                };

                res.render('expertRegistration/updateProfile', pageData);
            },
            function userFetchError() { res.send(500); }
        );
    }

    private saveProfile(req:express.Request, res:express.Response)
    {
        var userId = req[ApiConstants.USER].id;
        var user = req.body[ApiConstants.USER];

        this.userDelegate.update({id: userId}, user)
            .then(
            function userUpdated() { res.send(200); },
            function userUpdateError() { res.send(500); }
        );
    }

    private mobileVerification(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationDelegate().getSync(integrationId);

        var pageData = {
            integration: integration
        }
        res.render('expertRegistration/mobileVerification', pageData);
    }

    private expertComplete(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationDelegate().getSync(integrationId);
        var userId = req[ApiConstants.USER].id;
        var self = this;

        q.all([
                self.verificationCodeCache.deleteInvitationCode(req.session[ApiConstants.CODE], req.session[ApiConstants.INTEGRATION_ID]),
                self.integrationMemberDelegate.search({'user_id': userId, 'integration_id': integrationId}, null, null, [IncludeFlag.INCLUDE_SCHEDULE_RULES])
            ])
            .then(
            function scheduleRulesFetched(...args)
            {
                var member = new IntegrationMember(args[0][1][0]);
                var pageData = {
                    user: req[ApiConstants.USER],
                    integration: integration,
                    "SearchNTalkUri": Config.get(Config.CORAL_URI),
                    "schedule_rules": member[IncludeFlag.INCLUDE_SCHEDULE_RULES]
                };
                res.render('expertRegistration/complete', pageData);

                return self.emailDelegate.sendWelcomeEmail(integrationId, member);
            },
            function scheduleRulesFetchError(error)
            {
                // TODO: Debug why we can't send 500 error here
                res.send(500);
            });
    }
}
export = ExpertRegistrationRoute