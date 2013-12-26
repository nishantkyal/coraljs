import passport                         = require('passport');
import passportBearer                   = require('passport-http-bearer');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import IntegrationMember                = require('../models/IntegrationMember');

class AuthenticationDelegate {

    static STRATEGY_OAUTH = 'oauth';

    /** Static constructor workaround */
    private static ctor = (() =>
    {
        /** Username password strategy **/
        passport.use(AuthenticationDelegate.STRATEGY_OAUTH, new passportBearer.Strategy(
            function(token, done)
            {
                new IntegrationMemberDelegate().findValidAccessToken(token)
                    .then(
                    function integrationSearched(result)
                    {
                        var integrationMember = new IntegrationMember(result);
                        if (integrationMember.isValid())
                            done(null, integrationMember);
                        else
                            done(null);
                    },
                    function integrationSearchError(err)
                    {
                        done(err);
                    }
                )
            }
        ));

        /** Serialize user **/
        passport.serializeUser(function(user, done)
        {
            done(null, user);
        });

        /** Deserialize user **/
        passport.deserializeUser(function(obj, done)
        {
            done(null, obj);
        });

    })();

}
export = AuthenticationDelegate