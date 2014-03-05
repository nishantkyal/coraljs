///<reference path='../../SearchNTalk-Dashboard/_references.d.ts'/>
import connect_ensure_login                                         = require('connect-ensure-login');
import oauth2orize                                                  = require('oauth2orize');
import log4js                                                       = require('log4js');
import IntegrationDelegate                                          = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                                    = require('../delegates/IntegrationMemberDelegate');
import Integration                                                  = require('../models/Integration');
import IntegrationMember                                            = require('../models/IntegrationMember');
import IntegrationMemberRole                                        = require('../enums/IntegrationMemberRole');
import Utils                                                        = require('../common/Utils');

/*
 Delegate class to handle OAuth provider functionality
 */
class OAuthProviderDelegate
{
    private static server:oauth2orize.Server = oauth2orize.createServer();
    private static logger:log4js.Logger = log4js.getLogger(Utils.getClassName('OAuthProviderDelegate'));

    static authorization = [
        connect_ensure_login.ensureLoggedIn(),
        OAuthProviderDelegate.server.authorization(
            function checkIntegration(integrationId, redirectURI, done)
            {
                var search = {};
                search[Integration.ID] = integrationId;
                search[Integration.REDIRECT_URL] = redirectURI;

                new IntegrationDelegate().search(search)
                    .then(
                    function integrationFetched(integrations)
                    {
                        if (integrations.length != 0)
                        {
                            OAuthProviderDelegate.logger.warn('Oauth code exchange failed because of invalid redirect url for integration id, %s', integrationId);
                            return done('An error occurred');
                        }
                        else
                            return done(null, integrations[0], redirectURI);
                    },
                    function integrationFetchError(error) { done(error); }
                );
            })
    ]

    static decision = [
        connect_ensure_login.ensureLoggedIn(),
        OAuthProviderDelegate.server.decision()
    ]

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        OAuthProviderDelegate.server.serializeClient(function (integration, done)
        {
            return done(null, integration.getId());
        });

        OAuthProviderDelegate.server.deserializeClient(function (integrationId, done)
        {
            var integration = new IntegrationDelegate().get(integrationId);
            return !Utils.isNullOrEmpty(integration) ? done(null, integration) : done('No integration found for integrationId: ' + integrationId);
        });

        OAuthProviderDelegate.server.grant(oauth2orize.grant.code(function (integration, redirectURI, user, ares, done)
        {
            var expert = new IntegrationMember();
            expert.setUserId(user.id);
            expert.setIntegrationId(integration.id);
            expert.setRole(IntegrationMemberRole.Expert);

            new IntegrationMemberDelegate().create(expert)
                .then(
                function expertCreated(expert) { done(null, expert.getAuthCode()); },
                function expertCreateError(err) { done(err); }
            );
        }));

        OAuthProviderDelegate.server.exchange(oauth2orize.exchange.code(function (integration, code, redirectURI, done):any
        {
            var search = {};
            search[IntegrationMember.AUTH_CODE] = code;
            search[IntegrationMember.INTEGRATION_ID] = code;

            if (integration.getRedirectUrl() != redirectURI)
            {
                OAuthProviderDelegate.logger.warn('Oauth code exchange failed because of invalid redirect url for integration id, %s', integration.id);
                return done('An error occurred');
            }
            new IntegrationMemberDelegate().search(search)
                .then(
                function handleExpertFoundForAuthCode(integrationMembers)
                {
                    if (integrationMembers.length == 0)
                        done('')
                },
                function expertSearchError(err) { done(err); });
        }));

    })();

}
export = OAuthProviderDelegate