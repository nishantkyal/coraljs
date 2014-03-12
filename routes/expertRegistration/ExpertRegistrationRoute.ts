///<reference path='../../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import passport                                             = require('passport');
import RequestHandler                                       = require('../../middleware/RequestHandler');
import OAuthProviderDelegate                                = require('../../delegates/OAuthProviderDelegate');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                         = require('../../delegates/UserDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import VerificationCodeCache                                = require('../../caches/VerificationCodeCache');
import IntegrationDelegate                                  = require('../../delegates/IntegrationDelegate');
import Integration                                          = require('../../models/Integration');
import User                                                 = require('../../models/User');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IntegrationType                                      = require('../../enums/IntegrationType');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import Config                                               = require('../../common/Config');
import Utils                                                = require('../../common/Utils');
import Urls                                                 = require('./Urls');

class ExpertRegistrationRoute
{
    userDelegate = new UserDelegate();
    integrationMemberDelegate = new IntegrationMemberDelegate();

    constructor(app)
    {
        // Pages
        app.get(Urls.index(), this.authenticate.bind(this));
        app.get(Urls.authorization(), OAuthProviderDelegate.authorization, this.authorize.bind(this));
        app.get(Urls.complete(), this.expertComplete.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: Urls.index(), failureFlash: true}), this.authenticationSuccess.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register({failureRedirect: Urls.index(), failureFlash: true}), this.authenticationSuccess.bind(this));
        app.get(Urls.linkedInLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {failureRedirect: Urls.index(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress']}));
        app.get(Urls.linkedInLoginCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {failureRedirect: Urls.index(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress']}), this.authenticationSuccess.bind(this));
        app.post(Urls.authorizationDecision(), OAuthProviderDelegate.decision);
        app.post(Urls.alreadyRegistered(), this.alreadyRegistered.bind(this));
    }

    /* Render login/register page */
    private authenticate(req, res:express.Response):any
    {
        var self = this;
        var integrationId = parseInt(req.query[ApiConstants.INTEGRATION_ID] || req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationDelegate().getSync(integrationId);
        var invitationCode:string = req.query[ApiConstants.CODE] || req.session[ApiConstants.CODE];
        var invitedMember;

        if (Utils.isNullOrEmpty(integration))
            return res.send(404, 'The integration id was not found');

        // Add invitation code and integration id to session
        req.session[ApiConstants.INTEGRATION_ID] = integrationId;
        req.session[ApiConstants.CODE] = invitationCode;

        new VerificationCodeCache().searchInvitationCode(invitationCode, integrationId)
            .then(
            function verified(result)
            {
                invitedMember = result;
                var invitedMemberEmail = invitedMember.user.email;
                return this.userDelegate.find({email: invitedMemberEmail})
            },
            function verificationFailed() { res.send(401, "The invitation is either invalid or has expired"); }
        )
            .then(
            function userFound(user:User):any
            {
                if (!Utils.isNullOrEmpty(user))
                {
                    req.logIn(user);
                    return self.integrationMemberDelegate.find({'user_id': user.getId(), integration_id: integrationId})
                }
                else
                {
                    var member = new IntegrationMember(invitedMember);
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.render('expertRegistration/authenticate', {'integration': integration, messages: req.flash(), member: member, user: member.getUser(), code: invitationCode});
                }
            })
            .then(
            function expertFound(expert:IntegrationMember)
            {
                if (!Utils.isNullOrEmpty(expert))
                {
                    req.session[ApiConstants.EXPERT] = expert;
                    res.redirect(Urls.alreadyRegistered());
                }
                else
                {
                    var integration = new IntegrationDelegate().getSync(integrationId);
                    var redirectUrl = integration.getIntegrationType() == IntegrationType.SHOP_IN_SHOP ? Urls.complete() : integration.getRedirectUrl();
                    res.redirect(Urls.authorization(integrationId, redirectUrl));
                }
            })
            .fail(
            function handleError(error) { res.send(500); }
        );
    }


    /* Handle authentication success -> Redirect to authorization */
    private authenticationSuccess(req:express.Request, res:express.Response)
    {
        var integrationId = req.session[ApiConstants.INTEGRATION_ID];
        var integration = new IntegrationDelegate().getSync(integrationId);
        var redirectUrl = integration.getIntegrationType() == IntegrationType.SHOP_IN_SHOP ? Urls.complete() : integration.getRedirectUrl();
        req.session[ApiConstants.INTEGRATION_ID] = integrationId;

        var authorizationUrl = Urls.authorization(integrationId, redirectUrl);

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

    private expertComplete(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationDelegate().getSync(integrationId);
        var userId = req['user'].id;

        q.all([
                new VerificationCodeCache().deleteInvitationCode(req.session[ApiConstants.CODE], req.session[ApiConstants.INTEGRATION_ID]),
                new IntegrationMemberDelegate().search({'user_id': userId, 'integration_id': integrationId}, null, [IncludeFlag.INCLUDE_SCHEDULE_RULES])
            ])
            .then(
            function scheduleRulesFetched(members)
            {
                var member = members[0]
                var pageData = {
                    user: req['user'],
                    integration: integration,
                    "SearchNTalkUri": Config.get('SearchNTalk.uri'),
                    "schedule_rules": member[IncludeFlag.INCLUDE_SCHEDULE_RULES]
                };
                res.render('expertRegistration/complete', pageData);
            },
            function scheduleRulesFetchError(error)
            {
                // TODO: Debug why we can't send 500 error here
                res.send(500);
            }
        );
    }

    private alreadyRegistered(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationDelegate().getSync(integrationId);

        var pageData = {
            user: req['user'],
            integration: integration,
            "SearchNTalkUri": Config.get('SearchNTalk.uri')
        };

        res.render('expertRegistration/alreadyRegistered', pageData)
    }
}
export = ExpertRegistrationRoute