import oauth2orize                                                  = require('oauth2orize');
import log4js                                                       = require('log4js');
import AuthenticationDelegate                                       = require('../delegates/AuthenticationDelegate');
import IntegrationDelegate                                          = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                                    = require('../delegates/IntegrationMemberDelegate');
import NotificationDelegate                                         = require('../delegates/NotificationDelegate');
import Integration                                                  = require('../models/Integration');
import IntegrationMember                                            = require('../models/IntegrationMember');
import IntegrationMemberRole                                        = require('../enums/IntegrationMemberRole');
import Utils                                                        = require('../common/Utils');

/**
 * Delegate class to handle OAuth provider functionality
 */
class OAuthProviderDelegate
{
    private static server:oauth2orize.Server = oauth2orize.createServer();
    private static logger:log4js.Logger = log4js.getLogger('OAuthProviderDelegate');

    static authorization = [
        AuthenticationDelegate.checkLogin(),
        OAuthProviderDelegate.server.authorization(
            function checkIntegration(integrationId, redirectURI, done)
            {
                var search = {};
                search[Integration.ID] = integrationId;

                var integrationDelegate = new IntegrationDelegate();
                integrationDelegate.find(search)
                    .then(
                    function integrationFetched(integration)
                    {
                        if (Utils.isNullOrEmpty(integration))
                        {
                            OAuthProviderDelegate.logger.warn('Oauth code exchange failed because of INVALID INTEGRATION ID, %s', integrationId);
                            return done('An error occurred');
                        }
                        else if (!Utils.isNullOrEmpty(integration.getRedirectUrl()) && integration.getRedirectUrl() != redirectURI)
                        {
                            OAuthProviderDelegate.logger.warn('Oauth code exchange failed because of INVALID REDIRECT URL %s for integration id ', redirectURI, integrationId);
                            return done('An error occurred');
                        }
                        else
                            return done(null, integration, redirectURI);
                    },
                    function integrationFetchError(error) { done(error); }
                );
            })
    ]

    static decision = [
        AuthenticationDelegate.checkLogin(),
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
            var integration = new IntegrationDelegate().getSync(integrationId);
            return !Utils.isNullOrEmpty(integration) ? done(null, integration) : done('No integration found for integrationId: ' + integrationId);
        });

        OAuthProviderDelegate.server.grant(oauth2orize.grant.code(function (integration, redirectURI, user, ares, done)
        {
            var expert = new IntegrationMember();
            expert.setUserId(user.id);
            expert.setIntegrationId(integration.id);
            expert.setRole(IntegrationMemberRole.Expert);

            OAuthProviderDelegate.logger.debug('Creating expert for user id: %s, integration id: %s', user.id, integration.id);

            var integrationMemberDelegate = new IntegrationMemberDelegate();
            var notificationDelegate = new NotificationDelegate();

            integrationMemberDelegate.create(expert)
                .then(
                function existingCreated(expert:IntegrationMember)
                {
                    return notificationDelegate.sendExpertRegistrationCompleteNotification(expert)
                        .then(
                        function notificationSent() { return expert; },
                        function notificationSendError() { return expert; }
                    );
                },
                function expertCreateError(error):any
                {
                    if (error.code == 'ER_DUP_ENTRY')
                        return integrationMemberDelegate.find({integration_id: expert.getIntegrationId(), user_id: expert.getUserId()}, [IntegrationMember.AUTH_CODE]);
                    throw(error);
                })
                .then(
                function success(expert:IntegrationMember)
                {
                    done(null, expert.getAuthCode());
                },
                function error(error)
                {
                    done(error);
                });
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
            new IntegrationMemberDelegate().find(search)
                .then(
                function handleExpertFoundForAuthCode(integrationMember)
                {
                    if (Utils.isNullOrEmpty(integrationMember.length))
                        done('');
                },
                function expertSearchError(err) { done(err); });
        }));

    })();

}
export = OAuthProviderDelegate