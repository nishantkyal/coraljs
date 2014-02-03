///<reference path='../delegates/IntegrationMemberDelegate'/>
///<reference path='../models/IntegrationMember.ts'/>
module delegates
{
    export class AuthenticationDelegate
    {
        static STRATEGY_OAUTH:string = 'oauth';

        /** Static constructor workaround */
        private static ctor = (() =>
        {
            // Username password strategy
            passport.use(AuthenticationDelegate.STRATEGY_OAUTH, new passporthttpbearer.HttpBearerStrategy (
                function(token, done)
                {
                    new delegates.IntegrationMemberDelegate().findValidAccessToken(token)
                        .then(
                        function integrationSearched(result)
                        {
                            var integrationMember = new models.IntegrationMember(result);
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

            // Serialize user
            passport.serializeUser(function(user, done)
            {
                done(null, user);
            });

            // Deserialize user
            passport.deserializeUser(function(obj, done)
            {
                done(null, obj);
            });

        })();

    }
}