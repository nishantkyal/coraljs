///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import http                                     = require('http');
import express                                  = require('express');
import passport                                 = require('passport');
import url                                      = require('url');
import q                                        = require('q');
import passport_http_bearer                     = require('passport-http-bearer');
import passport_facebook                        = require('passport-facebook');
import passport_linkedin                        = require('passport-linkedin');
import passport_local                           = require('passport-local');
import log4js                                   = require('log4js');
import IntegrationMemberDelegate                = require('../delegates/IntegrationMemberDelegate');
import UserDelegate                             = require('../delegates/UserDelegate');
import UserProfileDelegate                      = require('../delegates/UserProfileDelegate');
import UserOAuthDelegate                        = require('../delegates/UserOAuthDelegate');
import MysqlDelegate                            = require('../delegates/MysqlDelegate');
import EmailDelegate                            = require('../delegates/EmailDelegate');
import ApiUrlDelegate                           = require('../delegates/ApiUrlDelegate');
import VerificationCodeDelegate                 = require('../delegates/VerificationCodeDelegate');
import IntegrationMember                        = require('../models/IntegrationMember');
import UserOauth                                = require('../models/UserOauth');
import User                                     = require('../models/User');
import Config                                   = require('../common/Config');
import Utils                                    = require('../common/Utils');
import ApiConstants                             = require('../enums/ApiConstants');
import IndustryCodes                            = require('../enums/IndustryCode');
import UserStatus                               = require('../enums/UserStatus');
import ExpertRegistrationUrls                   = require('../routes/expertRegistration/Urls')
import DashboardUrls                            = require('../routes/dashboard/Urls')
import CallFlowUrls                             = require('../routes/callFlow/Urls');

class AuthenticationDelegate
{
    static STRATEGY_OAUTH:string = 'oauth';
    static STRATEGY_LOGIN:string = 'login';
    static STRATEGY_FACEBOOK:string = 'facebook';
    static STRATEGY_LINKEDIN:string = 'linkedin';
    static STRATEGY_FACEBOOK_CALL_FLOW:string = 'facebook-call';
    static STRATEGY_LINKEDIN_EXPERT_REGISTRATION:string = 'linkedin-expert';
    static STRATEGY_LINKEDIN_FETCH = 'linkedin-fetch';
    static STRATEGY_LINKEDIN_CALL_LOGIN = 'linkedin-call-login';

    private static logger = log4js.getLogger('AuthenticationDelegate');

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        // Username password strategy
        AuthenticationDelegate.configureOauthStrategy();
        AuthenticationDelegate.configureLocalStrategy();

        /* Facebook login */
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK, url.resolve(Config.get(Config.DASHBOARD_URI), '/login/fb/callback'));
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, url.resolve(Config.get(Config.DASHBOARD_URI), CallFlowUrls.facebookLoginCallback()));

        /* Linkedin login */
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN, url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.linkedInLoginCallback()));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, url.resolve(Config.get(Config.DASHBOARD_URI), ExpertRegistrationUrls.linkedInLoginCallback()));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.userProfileFromLinkedInCallback()));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_CALL_LOGIN, url.resolve(Config.get(Config.DASHBOARD_URI), CallFlowUrls.linkedInLoginCallback()));

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
            var code = req.body[ApiConstants.CODE] || req.query[ApiConstants.CODE];
            var user = req.body[ApiConstants.USER];
            var isUserValid = user.isValid() && !Utils.isNullOrEmpty(user.getPassword()) && !Utils.isNullOrEmpty(user.getFirstName())
            var userDelegate = new UserDelegate();
            var verificationCodeDelegate = new VerificationCodeDelegate();

            // 1. If no verification code, create one using user object from request and send
            if (Utils.isNullOrEmpty(code) && isUserValid)
                verificationCodeDelegate.createAndSendEmailVerificationCode(user)
                    .then(
                    function verificationCodeSent()
                    {
                        req.flash('info', "We've sent you an email with verification link to verify your email address. You may do it later but your account will not become active until then.");
                        res.redirect(options.failureRedirect);
                    },
                    function verificationCodeSendError(error)
                    {
                        req.flash('info', JSON.stringify(error));
                        res.redirect(options.failureRedirect);
                    });

            // 2. Else fetch user associated with code and create account
            if (!Utils.isNullOrEmpty(code))
                verificationCodeDelegate.verifyEmailVerificationCode(code)
                    .then(
                    function userFetched(result)
                    {
                        return userDelegate.create(new User(result));
                    })
                    .then(
                    function userRegistered(user)
                    {
                        req.logIn(user, next)
                    },
                    function registrationError(error)
                    {
                        req.flash('info', JSON.stringify(error));
                        res.redirect(options.failureRedirect);
                    });


        }
    }

    private static configureLocalStrategy()
    {
        passport.use(AuthenticationDelegate.STRATEGY_LOGIN, new passport_local.Strategy(function (username, password, done)
            {
                var userDelegate = new UserDelegate();
                userDelegate.find({email: username}, User.DEFAULT_FIELDS.concat(User.PASSWORD))
                    .then(
                    function authComplete(user)
                    {
                        var hashedPassword = userDelegate.computePasswordHash(username, password);
                        if (Utils.isNullOrEmpty(user))
                            done(null, false, {message: 'Invalid email'});
                        else if (hashedPassword != user.getPassword())
                            done(null, false, {message: 'Invalid password'});
                        else
                            done(null, user);
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
                clientID: Config.get(Config.FB_APP_ID),
                clientSecret: Config.get(Config.FB_APP_SECRET),
                callbackURL: callbackUrl,
                profileFields: profileFields
            },
            function (accessToken, refreshToken, profile, done)
            {
                var profile = profile['_json'];

                var user:User = new User();
                if (profile.name)
                    user.setFirstName(profile.first_name);
                user.setLastName(profile.last_name);
                user.setEmail(profile.email);
                user.setStatus(UserStatus.MOBILE_NOT_VERIFIED);

                var userOauth = new UserOauth();
                userOauth.setOauthUserId(profile.id);
                userOauth.setProviderId('FB');
                userOauth.setAccessToken(accessToken);
                userOauth.setRefreshToken(refreshToken);
                userOauth.setEmail(profile.email);

                new UserOAuthDelegate().addOrUpdateToken(userOauth, user)
                    .then(
                    function tokenUpdated(oauth:UserOauth)
                    {
                        return new UserDelegate().get(oauth.getUserId());
                    })
                    .then(
                    function userFetched(createdUser:User):any
                    {
                        user.setId(createdUser.getId());

                        if (createdUser.isValid())
                            done(null, createdUser)
                        else
                            done('Login failed');

                        return createdUser;
                    },
                    function tokenUpdateError(error)
                    {
                        AuthenticationDelegate.logger.error('An error occurred while logging in using facebook. Error: %s', JSON.stringify(error));
                        done(error);
                    });
            }
        ));
    }

    private static configureLinkedInStrategy(strategyId:string, callbackUrl:string)
    {
        passport.use(strategyId, new passport_linkedin.Strategy({
                consumerKey: Config.get(Config.LINKEDIN_API_KEY),
                consumerSecret: Config.get(Config.LINKEDIN_API_SECRET),
                callbackURL: callbackUrl,
                profileFields: UserProfileDelegate.BASIC_FIELDS,
                passReqToCallback: true
            },
            function (req, accessToken, refreshToken, profile:any, done)
            {
                profile = profile['_json'];

                var userOauth = new UserOauth();
                userOauth.setOauthUserId(profile.id);
                userOauth.setProviderId('LinkedIn');
                userOauth.setAccessToken(accessToken);
                userOauth.setRefreshToken(refreshToken);
                userOauth.setEmail(profile.emailAddress);

                var user = new User();
                user.setEmail(profile.emailAddress); //setting email id for new user, if user exists then this will be discarded
                user.setStatus(UserStatus.MOBILE_NOT_VERIFIED);

                return new UserOAuthDelegate().addOrUpdateToken(userOauth, user)
                    .then(
                    function tokenUpdated(oauth:UserOauth)
                    {
                        return new UserDelegate().get(oauth.getUserId());
                    })
                    .then(
                    function userFetched(createdUser:User):any
                    {
                        var userId:number
                        //check whether user is logged in or not
                        //if user is logged in then check whether user_id in created user (i.e. new user created or existing one returned by oauthDelegate)
                        //is same as loggedInUser. If not then give error as same oauth is associated with different account.
                        if (req.user)
                        {
                            userId = req.user.id;
                        }

                        if (!Utils.isNullOrEmpty(createdUser) && createdUser.isValid())
                            if (Utils.isNullOrEmpty(userId) || (createdUser.getId() == userId))
                                done(null, createdUser)
                            else
                                done('This LinkedIn account is already associated with another SearchNTalk.com account.');
                        else
                            done('Login failed');

                        return createdUser;
                    },
                    function tokenUpdateError(error)
                    {
                        AuthenticationDelegate.logger.error('An error occurred while logging in using linkedin. Error: %s', error);
                        done(error);
                    });
            }
        ));
    }
}
export = AuthenticationDelegate