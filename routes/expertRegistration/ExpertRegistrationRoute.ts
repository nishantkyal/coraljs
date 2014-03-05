///<reference path='../../_references.d.ts'/>
import express                                              = require('express');
import passport                                             = require('passport');
import OAuthProviderDelegate                                = require('../../delegates/OAuthProviderDelegate');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import VerificationCodeCache                                = require('../../caches/VerificationCodeCache');
import IntegrationCache                                     = require('../../caches/IntegrationCache');
import Integration                                          = require('../../models/Integration');
import User                                                 = require('../../models/User');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IntegrationType                                      = require('../../enums/IntegrationType');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import Config                                               = require('../../common/Config');
import Utils                                                = require('../../common/Utils');

class ExpertRegistrationRoute
{
    constructor(app)
    {
        // Pages
        app.get('/expert/registration', this.authenticate);
        app.get('/integration/authorize', OAuthProviderDelegate.authorization, this.authorize);
        app.get('/expert/registration/complete', this.expertComplete);
        app.post('/expert/registration/schedule', this.saveExpertPreferences);

        // Auth
        app.post('/expert/login', passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: '/authenticate'}), this.authenticationSuccess);
        app.post('/expert/register', AuthenticationDelegate.register, this.authenticationSuccess.bind(this));
        app.get('/expert/login/linkedin', passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {scope: ['r_basicprofile', 'r_emailaddress']}));
        app.get('/expert/login/linkedin/callback', passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, {failureRedirect: '/login', scope: ['r_basicprofile', 'r_emailaddress']}), this.authenticationSuccess);
        app.post('/integration/authorize/decision', OAuthProviderDelegate.decision);
    }

    /* Render login/register page */
    authenticate(req:express.Request, res:express.Response)
    {
        var integrationId = req.query[ApiConstants.INTEGRATION_ID] || req.session[ApiConstants.INTEGRATION_ID];
        var integration = new IntegrationCache().get(integrationId);
        var invitationCode:string = req.query[ApiConstants.CODE];

        if (!Utils.isNullOrEmpty(integration))
        {
            new VerificationCodeCache().searchInvitationCode(invitationCode, integrationId)
                .then(
                function verified()
                {
                    req.session[ApiConstants.INTEGRATION_ID] = integrationId;

                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.render('expertRegistration/authenticate', {'integration': integration});
                },
                function verificationFailed()
                {
                    res.send(401, "This is an invite only section");
                });
        }
        else
            res.send(404, 'The integration id was not found');
    }


    /* Handle authentication success -> Redirect to authorization */
    authenticationSuccess(req:express.Request, res:express.Response)
    {
        var integrationId = req.session[ApiConstants.INTEGRATION_ID];
        var integration = new IntegrationCache().get(integrationId);
        var redirectUrl = integration.getIntegrationType() == IntegrationType.SHOP_IN_SHOP ? Config.get('SearchNTalk.uri') + '/expert/registration/complete' : integration.getRedirectUrl();
        var user = req['user'];
        req.session[ApiConstants.INTEGRATION_ID] = integrationId;

        // Check if logged in member is already authorized
        new IntegrationMemberDelegate().search({user_id: user.id, integration_id: integrationId})
            .then(
            function expertSearched(response)
            {
                if (response.getBody().length == 0)
                    res.redirect('/integration/authorize?response_type=code&client_id=' + integrationId + '&redirect_uri=' + redirectUrl);
                else
                {
                    req.session[ApiConstants.EXPERT] = response.getBody()[0];
                    res.redirect('/expert/registration/complete');
                }
            },
            function expertSearchError(error)
            {
                res.redirect('/integration/authorize?response_type=code&client_id=' + integrationId + '&redirect_uri=' + redirectUrl);
            }
        )
    }

    /* Render authorization page */
    authorize(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.query[ApiConstants.INTEGRATION_ID] || req.session[ApiConstants.INTEGRATION_ID]);
        res.render('expertRegistration/authorize',
            {
                'transactionID': req['oauth2']['transactionID'],
                'user': new User(req.user.data),
                'integration': new IntegrationCache().get(integrationId)
            });
    }

    expertComplete(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integration = new IntegrationCache().get(integrationId);
        var userId = req['user'].id;

        new IntegrationMemberDelegate().search({'user_id': userId, 'integration_id': integrationId}, [IncludeFlag.INCLUDE_SCHEDULE_RULES])
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
            function scheduleRulesFetchError(error) { res.send(500, error.getBody()); }
        )
    }

    saveExpertPreferences(req:express.Request, res:express.Response)
    {
    }

}
export = ExpertRegistrationRoute