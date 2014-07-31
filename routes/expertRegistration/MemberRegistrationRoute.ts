import q                                                    = require('q');
import express                                              = require('express');
import passport                                             = require('passport');
import url                                                  = require('url');
import _                                                    = require('underscore');
import RequestHandler                                       = require('../../middleware/RequestHandler');
import OAuthProviderDelegate                                = require('../../delegates/OAuthProviderDelegate');
import UserOAuthDelegate                                    = require('../../delegates/UserOAuthDelegate');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import IntegrationDelegate                                  = require('../../delegates/IntegrationDelegate');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import UserPhoneDelegate                                    = require('../../delegates/UserPhoneDelegate');
import Integration                                          = require('../../models/Integration');
import User                                                 = require('../../models/User');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import UserProfile                                          = require('../../models/UserProfile');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IntegrationMemberRole                                = require('../../enums/IntegrationMemberRole');
import Config                                               = require('../../common/Config');
import Utils                                                = require('../../common/Utils');
import AuthenticationUrls                                   = require('../../routes/authentication/Urls');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');

import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');
import Middleware                                           = require('./Middleware');

class MemberRegistrationRoute
{
    private static PAGE_AUTHORIZE:string = 'memberRegistration/authorize';
    private static PAGE_COMPLETE:string = 'memberRegistration/complete';

    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();

    constructor(app, secureApp)
    {
        // Pages
        app.get(Urls.index(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.index.bind(this));
        app.get(Urls.authorization(), Middleware.requireInvitationCode, Middleware.ensureNotAlreadyRegistered, OAuthProviderDelegate.authorization, this.authorize.bind(this));
        app.get(Urls.authorizationRedirect(), this.authorizationRedirect.bind(this));
        app.get(Urls.complete(), AuthenticationDelegate.checkLogin({failureRedirect: Urls.index()}), this.expertComplete.bind(this));

        // Auth
        app.post(Urls.authorizationDecision(), OAuthProviderDelegate.decision);
    }

    /* Render login/register page */
    private index(req, res:express.Response):void
    {
        var sessionData = new SessionData(req);

        var integrationId = parseInt(req.query[ApiConstants.INTEGRATION_ID] || sessionData.getIntegrationId());
        var integration = new IntegrationDelegate().getSync(integrationId);

        var invitationCode:string = req.query[ApiConstants.CODE] || sessionData.getInvitationCode();
        var invitedMember:IntegrationMember = new IntegrationMember();

        if (Utils.isNullOrEmpty(integration))
        {
            res.send(404, 'The integration id was not found');
            return;
        }

        // Add integration id to session
        sessionData.setIntegrationId(integrationId);
        sessionData.setIntegration(integration);

        // 1. Validate invitation code
        // 2. Authenticate

        var authorizationUrl = Urls.authorization() + '?response_type=code&client_id=' + integrationId + '&redirect_uri=' + Urls.authorizationRedirect();
        if (integrationId == Config.get(Config.DEFAULT_NETWORK_ID))
        {
            invitedMember.setRole(IntegrationMemberRole.Expert);
            sessionData.setMember(invitedMember);

            res.redirect(authorizationUrl);
        }
        else
        {
            //Add invitation code to session
            sessionData.setInvitationCode(invitationCode);

            this.verificationCodeDelegate.searchInvitationCode(invitationCode, integrationId)
                .then(
                function verified(result):any
                {
                    invitedMember = new IntegrationMember(result);
                    sessionData.setMember(invitedMember);

                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.redirect(authorizationUrl);
                },
                function verificationFailed()
                {
                    throw(new Error("The invitation is either invalid or has expired"));
                })
                .fail(
                function handleError(error) { res.render('500', {error: error}); }
            );
        }
    }

    /* Render authorization page */
    private authorize(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        var pageData = _.extend(sessionData.getData(), {
            'transactionID': req['oauth2']['transactionID']
        });

        res.render(MemberRegistrationRoute.PAGE_AUTHORIZE, pageData);
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
        var member = sessionData.getMember();
        var user:User = sessionData.getLoggedInUser();
        var userId:number = user.getId();

        var mobileVerificationUrl = Utils.addQueryToUrl(DashboardUrls.mobileVerification(), Utils.createSimpleObject(ApiConstants.CONTEXT, 'expertRegistration'));
        var redirectUrl = '';

        // Redirect new expert to mobile verification
        // Others to registration complete page
        switch (parseInt(member.getRole().toString()))
        {
            case IntegrationMemberRole.Expert:
                redirectUrl = !Utils.isNullOrEmpty(integration.getRedirectUrl()) ? mobileVerificationUrl : integration.getRedirectUrl();
                break;

            default:
            case IntegrationMemberRole.Admin:
            case IntegrationMemberRole.Owner:
                redirectUrl = Urls.complete();
                break;
        }

        // 1. Update role and redirect
        // 2. Delete invitation code
        q.all([
            self.verificationCodeDelegate.deleteInvitationCode(sessionData.getInvitationCode(), sessionData.getIntegrationId()),
            self.integrationMemberDelegate.update({'user_id': userId, 'integration_id': integrationId}, {role: member.getRole()})
        ])
            .finally(
            function memberRoleCorrected()
            {
                res.redirect(redirectUrl);
            });
    }

    /* Registration Complete - Page */
    private expertComplete(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var integrationId = sessionData.getIntegrationId();
        var userId = sessionData.getLoggedInUser().getId();
        var self = this;

        self.integrationMemberDelegate.find({'user_id': userId, 'integration_id': integrationId}, null, [IntegrationMember.FK_SCHEDULE_RULES])
            .then(
            function scheduleRulesFetched(member:IntegrationMember)
            {
                var pageData = _.extend(sessionData.getData(), {
                    "SearchNTalkUri": Config.get(Config.DASHBOARD_URI),
                    "schedule_rules": member.get,
                    member: member
                });

                res.render(MemberRegistrationRoute.PAGE_COMPLETE, pageData);
            },
            function scheduleRulesFetchError(error) { res.send(500); });
    }
}
export = MemberRegistrationRoute