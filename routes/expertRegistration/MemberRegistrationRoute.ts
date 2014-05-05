///<reference path='../../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import passport                                             = require('passport');
import connect_ensure_login                                 = require('connect-ensure-login');
import url                                                  = require('url');
import _                                                    = require('underscore');
import RequestHandler                                       = require('../../middleware/RequestHandler');
import OAuthProviderDelegate                                = require('../../delegates/OAuthProviderDelegate');
import UserOAuthDelegate                                    = require('../../delegates/UserOAuthDelegate');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                         = require('../../delegates/UserDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import UserProfileDelegate                                  = require('../../delegates/UserProfileDelegate');
import VerificationCodeCache                                = require('../../caches/VerificationCodeCache');
import IntegrationDelegate                                  = require('../../delegates/IntegrationDelegate');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import Integration                                          = require('../../models/Integration');
import User                                                 = require('../../models/User');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import UserProfile                                          = require('../../models/UserProfile');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IntegrationType                                      = require('../../enums/IntegrationType');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import IntegrationMemberRole                                = require('../../enums/IntegrationMemberRole');
import ProfileStatus                                        = require('../../enums/ProfileStatus');
import Config                                               = require('../../common/Config');
import Utils                                                = require('../../common/Utils');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');

import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');
import Middleware                                           = require('./Middleware');

class MemberRegistrationRoute
{
    private userDelegate = new UserDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private verificationCodeCache = new VerificationCodeCache();
    private emailDelegate = new EmailDelegate();
    private userProfileDelegate = new UserProfileDelegate();

    constructor(app, secureApp)
    {
        // Pages
        app.get(Urls.index(), this.index.bind(this));
        app.get(Urls.login(), Middleware.requireInvitationCode, this.login.bind(this));
        app.get(Urls.register(), Middleware.requireInvitationCode, this.register.bind(this));
        app.get(Urls.authorization(), OAuthProviderDelegate.authorization, this.authorize.bind(this));
        app.get(Urls.authorizationRedirect(), this.authorizationRedirect.bind(this));
        app.get(Urls.complete(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.index()}), this.expertComplete.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: Urls.login(), failureFlash: true}), this.authenticationSuccess.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register({failureRedirect: Urls.register(), failureFlash: true}), this.authenticationSuccess.bind(this));
        app.get(Urls.linkedInLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {failureRedirect: Urls.login(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));
        app.get(Urls.linkedInLoginCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {failureRedirect: Urls.login(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}), this.authenticationSuccess.bind(this));
        app.post(Urls.authorizationDecision(), OAuthProviderDelegate.decision, this.authorizationError.bind(this));
    }

    /* Render login/register page */
    private index(req, res:express.Response):void
    {
        var self = this;
        var sessionData = new SessionData(req);

        var integrationId = parseInt(req.query[ApiConstants.INTEGRATION_ID] || sessionData.getIntegrationId());
        var integration = new IntegrationDelegate().getSync(integrationId);

        var invitationCode:string = req.query[ApiConstants.CODE] || sessionData.getInvitationCode();
        var invitedMember;

        if (Utils.isNullOrEmpty(integration))
        {
            res.send(404, 'The integration id was not found');
            return;
        }

        // Add invitation code and integration id to session
        sessionData.setInvitationCode(invitationCode);
        sessionData.setIntegrationId(integrationId);
        sessionData.setIntegration(integration);

        this.verificationCodeCache.searchInvitationCode(invitationCode, integrationId)
            .then(
            function verified(result):any
            {
                invitedMember = new IntegrationMember(result);
                var invitedMemberEmail = invitedMember.getUser()[User.EMAIL];
                return self.integrationMemberDelegate.findByEmail(invitedMemberEmail, integrationId)
            },
            function verificationFailed()
            {
                throw("The invitation is either invalid or has expired");
            })
            .then(
            function expertFound(expert:IntegrationMember)
            {
                // Continue to mobile verification if
                // 1. Expert already exists
                // 2. Expert is linked to logged in user (if user is logged in)
                // Else
                // 1. Destroy session
                // 2. Display login page
                var isExpertValid = !Utils.isNullOrEmpty(expert) && expert.isValid();
                var isLoggedIn = !Utils.isNullOrEmpty(sessionData.getLoggedInUser());
                var isExpertLinkedToLoggedInUser = isLoggedIn && (isExpertValid && expert.getUserId() == sessionData.getLoggedInUser().getId());

                if (isExpertValid)
                {
                    sessionData.setMember(expert);
                    req.logIn(expert.getUser());
                    res.redirect(Utils.addQueryToUrl(DashboardUrls.mobileVerification(), Utils.createSimpleObject(ApiConstants.CONTEXT, 'expertRegistration')));
                }
                else
                {
                    var member = new IntegrationMember(invitedMember);
                    sessionData.setMember(member);
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    req.logout();
                    res.redirect(Urls.register());
                }
            })
            .fail(
            function handleError(error) { res.send(500, error); }
        );
    }

    private login(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var pageData = _.extend(sessionData.getData(), {
            messages: req.flash(),
            context: 'expertRegistration'
        });

        res.render('expertRegistration/login', pageData);
    }

    private register(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var pageData = _.extend(sessionData.getData(), {
            messages: req.flash(),
            context: 'expertRegistration'
        });

        res.render('expertRegistration/register', pageData);
    }

    /* Handle authentication success -> Redirect to authorization */
    private authenticationSuccess(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var integrationId = sessionData.getIntegrationId();
        req.flash(ApiConstants.RETURN_TO, Urls.complete());

        var authorizationUrl = Urls.authorization() + '?response_type=code&client_id=' + integrationId + '&redirect_uri=' + Urls.authorizationRedirect();
        res.redirect(authorizationUrl);
    }

    /* Render authorization page */
    private authorize(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        var pageData = _.extend(sessionData.getData(), {
            'transactionID': req['oauth2']['transactionID']
        });

        res.render('expertRegistration/authorize', pageData);
    }

    private authorizationError(req:express.Request, res:express.Response)
    {
        res.send(500);
    }

    /*
     Authorization redirect is used to update the role of the created member to match the invite
     Since we can't do this while creating the expert in OauthProviderDelegate
     */
    private authorizationRedirect(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var integrationId = sessionData.getIntegrationId();
        var integration = sessionData.getIntegration();
        var userId = sessionData.getLoggedInUser().getId();
        var member = sessionData.getMember();
        var profileId:number;

        var mobileVerificationUrl = Utils.addQueryToUrl(DashboardUrls.mobileVerification(), Utils.createSimpleObject(ApiConstants.CONTEXT, 'expertRegistration'));
        var redirectUrl = '';

        switch (parseInt(member.getRole().toString()))
        {
            case IntegrationMemberRole.Expert:
                redirectUrl = integration.getIntegrationType() == IntegrationType.SHOP_IN_SHOP ? mobileVerificationUrl : integration.getRedirectUrl();
                break;

            case IntegrationMemberRole.Admin:
            case IntegrationMemberRole.Owner:
                redirectUrl = DashboardUrls.index();
                break;
        }

        // 1. Update role and redirect
        // 2. Schedule the mobile verification reminder notification
        q.all([
            self.userProfileDelegate.create(new UserProfile()),
            self.integrationMemberDelegate.update({'user_id': userId, 'integration_id': integrationId}, {role: member.getRole()})
        ])
            .then(
            function profileCreated(...args)
            {
                var userProfile:UserProfile = args[0][0];
                profileId = userProfile.getId();
                return self.userProfileDelegate.fetchAllDetailsFromLinkedIn(userId, integrationId, profileId)
            })
            .then(
            function profileUpdated()
            {
                var userProfile:UserProfile = new UserProfile();
                userProfile.setStatus(ProfileStatus.PENDING_APPROVAL);
                return self.userProfileDelegate.update({id: profileId}, userProfile)
            },
            function profileUpdateError(error)
            {
                var userProfile:UserProfile = new UserProfile();
                userProfile.setStatus(ProfileStatus.INCOMPLETE);
                return self.userProfileDelegate.update({id: profileId}, userProfile)
            })
            .finally(
            function memberRoleCorrected()
            {
                res.redirect(redirectUrl);
            });
    }

    private expertComplete(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var integrationId = sessionData.getIntegrationId();
        var userId = sessionData.getLoggedInUser().getId();
        var self = this;

        q.all([
            self.verificationCodeCache.deleteInvitationCode(req.session[ApiConstants.CODE], req.session[ApiConstants.INTEGRATION_ID]),
            self.integrationMemberDelegate.find({'user_id': userId, 'integration_id': integrationId}, null, [IncludeFlag.INCLUDE_SCHEDULE_RULES])
        ])
            .then(
            function scheduleRulesFetched(...args)
            {
                var member = new IntegrationMember(args[0][1]);
                var pageData = _.extend(sessionData.getData(), {
                    "SearchNTalkUri": Config.get(Config.DASHBOARD_URI),
                    "schedule_rules": member[IncludeFlag.INCLUDE_SCHEDULE_RULES],
                    member: member
                });
                res.render('expertRegistration/complete', pageData);
            },
            function scheduleRulesFetchError(error)
            {
                // TODO: Debug why we can't send 500 error here
                res.send(500);
            });
    }
}
export = MemberRegistrationRoute