///<reference path='../_references.d.ts'/>
import express                              = require('express');
import passport                             = require("passport");
import passport_http_bearer                 = require("passport-http-bearer");
import passport_facebook                    = require("passport-facebook");
import passport_linkedin                    = require('passport-linkedin');
import passport_local                       = require('passport-local');
import IntegrationMemberDelegate            = require('../delegates/IntegrationMemberDelegate');
import UserDelegate                         = require('../delegates/UserDelegate');
import UserOAuthDelegate                    = require('../delegates/UserOAuthDelegate');
import IntegrationMember                    = require('../models/IntegrationMember');
import UserOauth                            = require('../models/UserOauth');
import Config                               = require('../common/Config');
import User                                 = require('../models/User');
import ApiConstants                         = require('../enums/ApiConstants');

class AuthenticationDelegate
{
    static STRATEGY_OAUTH:string = 'oauth';
    static STRATEGY_LOGIN:string = 'login';
    static STRATEGY_REGISTER:string = 'register';
    static STRATEGY_FACEBOOK:string = 'facebook';
    static STRATEGY_LINKEDIN:string = 'linkedin';
    static STRATEGY_FACEBOOK_CALL_FLOW:string = 'facebook-call';
    static STRATEGY_LINKEDIN_EXPERT_REGISTRATION:string = 'linkedin-expert';

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        // Username password strategy
        AuthenticationDelegate.configureOauthStrategy();

        /* Facebook login */
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK, Config.get('SearchNTalk.uri') + '/login/fb/callback');
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, Config.get('SearchNTalk.uri') + '/call/login/fb/callback');

        /* Linkedin login */
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN, Config.get('SearchNTalk.uri') + '/login/linkedin/callback');
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, Config.get('SearchNTalk.uri') + '/expert/login/linkedin/callback');

        // Serialize-Deserialize user
        passport.serializeUser(function(user, done) { done(null, user); });
        passport.deserializeUser(function(obj, done) { done(null, obj); });

    })();

    static register(req, res:express.Response, next:Function)
    {
        var user = req.body[ApiConstants.USER];

        new UserDelegate().create(user)
            .then(
            function userRegistered(user)
            {
                req.logIn(user, next)
            },
            function registrationError(error) { res.send(500, 'An error occurred while registering user'); }
        );
    }

    private static configureOauthStrategy()
    {
        passport.use(AuthenticationDelegate.STRATEGY_OAUTH, new passport_http_bearer.Strategy(
            function(token, done)
            {
                new IntegrationMemberDelegate().findValidAccessToken(token)
                    .then(
                    function integrationSearched(integrationMember)
                    {
                        return integrationMember.isValid() ? done(null, integrationMember) : done(null);
                    },
                    function integrationSearchError(err) { done(err); }
                )
            }
        ));
    }
    private static configureFacebookStrategy(strategyId:string, callbackUrl:string, profileFields:string[] = ['id', 'name', 'emails'])
    {
        passport.use(strategyId, new passport_facebook.Strategy({
                clientID: Config.get("fb.app_id"),
                clientSecret: Config.get("fb.app_secret"),
                callbackURL: callbackUrl,
                profileFields: profileFields
            },
            function (accessToken, refreshToken, profile, done)
            {
                var profile = profile['_json'];

                var user:User = new User()
                user.setEmail(profile.email);
                user.setFirstName(profile.first_name);
                user.setLastName(profile.last_name);

                var userOauth = new UserOauth();
                userOauth.setOauthUserId(profile.id);
                userOauth.setProviderId("FB");
                userOauth.setAccessToken(accessToken);
                userOauth.setRefreshToken(refreshToken);

                new UserOAuthDelegate().addOrUpdateToken(userOauth, user)
                    .then(
                    function tokenUpdated(result:any)
                    {
                        var user = new User(result);
                        return user.isValid() ? done(null, user) : done('Login failed');
                    },
                    function tokenUpdateError(error) { done(error); }
                );
            }
        ));
    }

    private static configureLinkedInStrategy(strategyId:string, callbackUrl:string, profileFields:string[] = ['id', 'first-name', 'last-name', 'email-address', 'headline', 'summary'])
    {
        passport.use(strategyId, new passport_linkedin.Strategy({
                consumerKey: Config.get("linkedin.api_key"),
                consumerSecret: Config.get("linkedin.api_secret"),
                callbackURL: callbackUrl,
                profileFields: profileFields
            },
            function (accessToken, refreshToken, profile, done)
            {
                profile = profile['_json'];

                var user:User = new User()
                user.setEmail(profile.emailAddress);
                user.setFirstName(profile.firstName);
                user.setLastName(profile.lastName);
                user.setShortDesc(profile.headline);
                user.setLongDesc(profile.summary);

                var userOauth = new UserOauth();
                userOauth.setOauthUserId(profile.id);
                userOauth.setProviderId("LinkedIn");
                userOauth.setAccessToken(accessToken);
                userOauth.setRefreshToken(refreshToken);

                new UserOAuthDelegate().addOrUpdateToken(userOauth, user)
                    .then(
                    function tokenUpdated(result:any)
                    {
                        var user = new User(result);
                        return user.isValid() ? done(null, user) : done('Login failed');
                    },
                    function tokenUpdateError(error) { done(error); }
                );
            }
        ));
    }
}
export = AuthenticationDelegate