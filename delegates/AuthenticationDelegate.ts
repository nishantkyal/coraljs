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
import log4js                                   = require('log4js');
import IntegrationMemberDelegate                = require('../delegates/IntegrationMemberDelegate');
import UserDelegate                             = require('../delegates/UserDelegate');
import UserProfileDelegate                      = require('../delegates/UserProfileDelegate');
import UserOAuthDelegate                        = require('../delegates/UserOAuthDelegate');
import MysqlDelegate                            = require('../delegates/MysqlDelegate');
import EmailDelegate                            = require('../delegates/EmailDelegate');
import ApiUrlDelegate                           = require('../delegates/ApiUrlDelegate');
import VerificationCodeDelegate                 = require('../delegates/VerificationCodeDelegate');
import TimezoneDelegate                         = require('../delegates/TimezoneDelegate');
import IntegrationMember                        = require('../models/IntegrationMember');
import UserOauth                                = require('../models/UserOauth');
import User                                     = require('../models/User');
import Config                                   = require('../common/Config');
import Credentials                              = require('../common/Credentials');
import Utils                                    = require('../common/Utils');
import ApiConstants                             = require('../enums/ApiConstants');
import IndustryCodes                            = require('../enums/IndustryCode');
import ExpertRegistrationUrls                   = require('../routes/expertRegistration/Urls')
import DashboardUrls                            = require('../routes/dashboard/Urls')
import CallFlowUrls                             = require('../routes/callFlow/Urls');
import PaymentUrls                              = require('../routes/payment/Urls');

class AuthenticationDelegate
{
    static STRATEGY_OAUTH:string = 'oauth';
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
        // Oauth strategy
        AuthenticationDelegate.configureOauthStrategy();

        /* Facebook login */
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK, url.resolve(Config.get(Config.DASHBOARD_URI), '/login/fb/callback'));
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, url.resolve(Config.get(Config.DASHBOARD_URI), PaymentUrls.facebookLoginCallback()));

        /* Linkedin login */
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN, url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.linkedInLoginCallback()));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, url.resolve(Config.get(Config.DASHBOARD_URI), ExpertRegistrationUrls.linkedInLoginCallback()));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.userProfileFromLinkedInCallback()));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_CALL_LOGIN, url.resolve(Config.get(Config.DASHBOARD_URI), PaymentUrls.linkedInLoginCallback()));

        // Serialize-Deserialize user
        passport.serializeUser(function (user, done) { done(null, user); });
        passport.deserializeUser(function (obj, done) { done(null, obj); });

    })();

    /* Register method with support for ajax requests */
    static register(options:any = {})
    {
        return function (req, res:express.Response, next:Function)
        {
            var isAjax = req.get('content-type') && req.get('content-type').indexOf('application/json') != -1;
            var user = new User(req.body);

            if (user.isValid()
                && !Utils.isNullOrEmpty(user.getPassword())
                && !Utils.isNullOrEmpty(user.getFirstName()))
            {
                new UserDelegate().create(user)
                    .then(
                    function userRegistered(user)
                    {
                        return new VerificationCodeDelegate().createAndSendEmailVerificationCode(user)
                            .then(
                            function verificationEmailSent()
                            {
                                req.logIn(user, function ()
                                {
                                    if (options.successFlash)
                                        req.flash('info', "We've sent you an email with verification link to verify your email address. You may do it later but your account will not become active until then.");

                                    if (isAjax)
                                        res.send(200, {valid: true});
                                    else if (options.successRedirect)
                                        res.redirect(options.successRedirect);
                                    else
                                        next();
                                });
                            });
                    },
                    function registrationError(error)
                    {
                        if (isAjax)
                            res.send(500, JSON.stringify(error));
                        else
                        {
                            if (options.failureFlash)
                                req.flash('error', error.message);
                            res.redirect(options.failureRedirect || req.originalUrl);
                        }
                    });
            }
            else
            {
                if (isAjax)
                    res.send(400, 'Please fill in all the details correctly');
                else
                {
                    if (options.failureFlash)
                        req.flash('error', 'Please fill in all the details correctly');
                    res.redirect(options.failureRedirect || req.originalUrl);
                }
            }
        }
    }

    /* Check login method with support for ajax requests */
    static checkLogin(options:any = {})
    {
        options.failureRedirect = options.failureRedirect || DashboardUrls.login();
        options.justCheck = options.justCheck || false;
        options.setReturnTo = options.setReturnTo || true;

        return function (req, res:express.Response, next:Function):any
        {
            var isLoggedIn = req.isAuthenticated && req.isAuthenticated();
            var isAjax = req.get('content-type') && req.get('content-type').indexOf('application/json') != -1;

            if (isLoggedIn)
                if (!options.justCheck)
                    next();
                else
                    res.json(200, {valid: isLoggedIn});
            else
            {
                if (isAjax)
                    return res.json(200, {valid: isLoggedIn});
                else
                {
                    if (options.setReturnTo)
                        req.session[ApiConstants.RETURN_TO] = req.url;
                    return res.redirect(DashboardUrls.login());
                }
            }
        }
    }

    /* Login method with support for ajax requests */
    static login(options:any = {})
    {
        return function (req, res:express.Response, next:Function)
        {
            var isAjax = req.get('content-type') && req.get('content-type').indexOf('application/json') != -1;
            var user = new User(req.body);

            if (Utils.isNullOrEmpty(user.getEmail()) || Utils.isNullOrEmpty(user.getPassword()))
            {
                if (isAjax)
                    res.send(400, 'Please fill in all the details correctly');
                else
                {
                    if (options.failureFlash)
                        req.flash('error', 'Please fill in all the details correctly');
                    res.redirect(options.failureRedirect || req.originalUrl);
                }
            }

            var userDelegate = new UserDelegate();
            userDelegate.find(Utils.createSimpleObject(User.EMAIL, user.getEmail()), User.DEFAULT_FIELDS.concat(User.PASSWORD))
                .then(
                function authComplete(matchingUser:User)
                {
                    var hashedPassword = user.getPasswordHash();
                    var reason;

                    if (Utils.isNullOrEmpty(matchingUser))
                        reason = 'Invalid email';
                    else if (hashedPassword != matchingUser.getPassword())
                        reason = 'Invalid password';

                    if (!Utils.isNullOrEmpty(reason))
                        throw new Error(reason);
                    else
                    {
                        req.logIn(matchingUser, function ()
                        {
                            var returnToUrl:string = req.session[ApiConstants.RETURN_TO];
                            req.session[ApiConstants.RETURN_TO] = null;
                            if (isAjax)
                                res.json(200, {valid: true});
                            else if (options.successRedirect)
                                res.redirect(options.successRedirect);
                            else if (returnToUrl)
                                res.redirect(returnToUrl);
                            else
                                next();
                        });
                    }
                })
                .fail(
                function authFailed(error)
                {
                    if (isAjax)
                        res.send(500, error.message);
                    else
                    {
                        if (options.failureFlash)
                            req.flash('error', error.message);
                        res.redirect(options.failureRedirect || req.originalUrl);
                    }
                });
        }
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
                clientID: Credentials.get(Credentials.FB_APP_ID),
                clientSecret: Credentials.get(Credentials.FB_APP_SECRET),
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
                consumerKey: Credentials.get(Credentials.LINKEDIN_API_KEY),
                consumerSecret: Credentials.get(Credentials.LINKEDIN_API_SECRET),
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

                if (!Utils.isNullOrEmpty(req.session[ApiConstants.ZONE]))
                    user.setTimezone(req.session[ApiConstants.ZONE]);

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