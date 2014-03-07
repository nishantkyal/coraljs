///<reference path='../_references.d.ts'/>
import express                              = require('express');
import passport                             = require("passport");
import url                                  = require('url');
import passport_http_bearer                 = require("passport-http-bearer");
import passport_facebook                    = require("passport-facebook");
import passport_linkedin                    = require('passport-linkedin');
import passport_local                       = require('passport-local');
import IntegrationMemberDelegate            = require('../delegates/IntegrationMemberDelegate');
import UserDelegate                         = require('../delegates/UserDelegate');
import UserOAuthDelegate                    = require('../delegates/UserOAuthDelegate');
import IntegrationMember                    = require('../models/IntegrationMember');
import UserOauth                            = require('../models/UserOauth');
import User                                 = require('../models/User');
import Config                               = require('../common/Config');
import Utils                                = require('../common/Utils');
import ApiConstants                         = require('../enums/ApiConstants');

import ExpertRegistrationUrls               = require('../routes/expertRegistration/Urls')

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
        AuthenticationDelegate.configureLocalStrategy();

        /* Facebook login */
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK, url.resolve(Config.get('Coral.uri'), '/login/fb/callback'));
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, url.resolve(Config.get('SearchNTalk.uri'), '/call/login/fb/callback'));

        /* Linkedin login */
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN, url.resolve(Config.get('Coral.uri'), '/login/linkedin/callback'));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, url.resolve(Config.get('Coral.uri'), ExpertRegistrationUrls.linkedInLoginCallback()));

        // Serialize-Deserialize user
        passport.serializeUser(function (user, done) { done(null, user); });
        passport.deserializeUser(function (obj, done) { done(null, obj); });

    })();


    static register(options?:any)
    {
        options = options || {};
        options.failureRedirect = options.failureRedirect || '/login';

        return function (req, res:express.Response, next:Function)
        {
            var user = new User(req.body);
            if (user.isValid()
                    && !Utils.isNullOrEmpty(user.getPassword())
                        && !Utils.isNullOrEmpty(user.getFirstName()))
            {
                new UserDelegate().create(user)
                    .then(
                    function userRegistered(user) { req.logIn(user, next) },
                    function registrationError(error)
                    {
                        req.flash('info', error);
                        res.redirect(options.failureRedirect);
                    }
                );
            }
            else
            {
                req.flash('info', 'Please fill in all the details correctly');
                res.redirect(options.failureRedirect);
            }
        }
    }

    private static configureLocalStrategy()
    {
        passport.use(AuthenticationDelegate.STRATEGY_LOGIN, new passport_local.Strategy(function (username, password, done)
            {
                new UserDelegate().search({email: username})
                    .then(
                    function authComplete(users)
                    {
                        if (users.length != 1)
                            done(null, false, {message: 'Invalid email'});
                        else if (users[0].getPassword() != password)
                            done(null, false, {message: 'Invalid password'});
                        else
                            done(null, users[0]);
                    },
                    function authFailed(error) { done(error); });
            }
        ));
    }

    private static configureOauthStrategy()
    {
        passport.use(AuthenticationDelegate.STRATEGY_OAUTH, new passport_http_bearer.Strategy(
            function (token, done)
            {
                new IntegrationMemberDelegate().findValidAccessToken(token)
                    .then(
                    function integrationSearched(integrationMember) { done(null, integrationMember); },
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