var passport = require('passport');

var IntegrationMemberDelegate = require('../delegates/IntegrationMemberDelegate');
var IntegrationMember = require('../models/IntegrationMember');

var AuthenticationDelegate = (function () {
    function AuthenticationDelegate() {
    }
    AuthenticationDelegate.STRATEGY_OAUTH = 'oauth';

    AuthenticationDelegate.ctor = (function () {
        /** Username password strategy *
        passport.use(AuthenticationDelegate.STRATEGY_OAUTH, new passportBearer.HttpBearerStrategy (
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
        ));*/
        /** Serialize user **/
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        /** Deserialize user **/
        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });
    })();
    return AuthenticationDelegate;
})();

module.exports = AuthenticationDelegate;

//# sourceMappingURL=AuthenticationDelegate.js.map
