///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import http                                     = require('http');
import express                                  = require('express');
import passport                                 = require('passport');
import url                                      = require('url');
import q                                        = require('q');
import OAuth                                    = require('oauth');
import queryString                              = require('querystring');
import passport_http_bearer                     = require('passport-http-bearer');
import passport_facebook                        = require('passport-facebook');
import log4js                                   = require('log4js');
import moment                                   = require('moment');
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
import AuthenticationUrls                       = require('../routes/authentication/Urls')
import DashboardUrls                            = require('../routes/dashboard/Urls')
import ExpertRegistrationUrls                   = require('../routes/expertRegistration/Urls')
import CallFlowUrls                             = require('../routes/callFlow/Urls');
import PaymentUrls                              = require('../routes/payment/Urls');

class AuthenticationDelegate
{
    static STRATEGY_OAUTH:string = 'oauth';
    static STRATEGY_FACEBOOK:string = 'facebook';

    private static logger = log4js.getLogger('AuthenticationDelegate');

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        // Auth strategies
        AuthenticationDelegate.configureOauthStrategy();
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK);

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
                                req.logIn(user, next);
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
        options.failureRedirect = options.failureRedirect || AuthenticationUrls.login();
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
            else if (isAjax)
                return res.json(200, {valid: isLoggedIn});
            else
            {
                if (options.setReturnTo)
                    req.session[ApiConstants.RETURN_TO] = req.url;
                return res.redirect(AuthenticationUrls.login());
            }
        }
    }

    /* Login method with support for ajax requests */
    static login(options:any = {})
    {
        options.failureFlash = options.failureFlash || true;

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
                    {
                        if (isAjax)
                            res.send(500, reason);
                        else
                        {
                            if (options.failureFlash)
                                req.flash('error', reason);
                            res.redirect(options.failureRedirect || req.originalUrl);
                        }
                    }
                    else
                        req.logIn(matchingUser, next);
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

    private static configureFacebookStrategy(strategyId:string, profileFields:string[] = ['id', 'name', 'emails'])
    {
        passport.use(strategyId, new passport_facebook.Strategy({
                clientID: Credentials.get(Credentials.FB_APP_ID),
                clientSecret: Credentials.get(Credentials.FB_APP_SECRET),
                callbackURL: url.resolve(Config.get(Config.DASHBOARD_URI), AuthenticationUrls.fbLoginCallBack()),
                profileFields: profileFields,
                passReqToCallback: true
            },
            function (req, accessToken, refreshToken, profile, done)
            {
                var profile = profile['_json'];

                var user:User = new User();
                if (profile.name)
                    user.setFirstName(profile.first_name);
                user.setLastName(profile.last_name);
                user.setEmail(profile.email);

                try {
                    if (!Utils.isNullOrEmpty(req.cookies[ApiConstants.ZONE]))
                        user.setTimezone(req.cookie[ApiConstants.ZONE]);
                    else if (!Utils.isNullOrEmpty(req.cookies[ApiConstants.OFFSET]))
                        user.setTimezone(new TimezoneDelegate().getZoneByOffset(parseInt(req.cookies[ApiConstants.OFFSET])).getZoneId());
                } catch (e)
                {
                    user.setTimezone(1);
                }

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

    private static processLinkedInTokens(req, accessToken, refreshToken, expiry, profile:any, done)
    {
        profile = profile['_json'] || profile;

        var userOauth = new UserOauth();
        userOauth.setOauthUserId(profile.id);
        userOauth.setProviderId('LinkedIn');
        userOauth.setAccessToken(accessToken);
        userOauth.setRefreshToken(refreshToken);
        userOauth.setAccessTokenExpiry(expiry);
        userOauth.setEmail(profile.emailAddress);

        var user = new User();
        user.setEmail(profile.emailAddress); //setting email id for new user, if user exists then this will be discarded

        try {
            if (!Utils.isNullOrEmpty(req.cookies[ApiConstants.ZONE]))
                user.setTimezone(req.cookie[ApiConstants.ZONE]);
            else if (!Utils.isNullOrEmpty(req.cookies[ApiConstants.OFFSET]))
                user.setTimezone(new TimezoneDelegate().getZoneByOffset(parseInt(req.cookies[ApiConstants.OFFSET])).getZoneId());
        } catch (e)
        {
            user.setTimezone(194);
        }

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
                        req.logIn(createdUser, done);
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

    static linkedInLogin(req, res:express.Response, next:Function)
    {
        var self = this;
        var userId;

        if (req.user)
        {
            userId = req.user.id;
            new UserOAuthDelegate().find({'user_id':userId, 'provider_id':'LinkedIn'})
                .then( function oAuthSearched(userOauth:UserOauth)
                {
                    if (userOauth.getAccessTokenExpiry() <= moment().valueOf())
                        AuthenticationDelegate.fetchLinkedInOauthToken(req, res, next);
                    else
                        next();
                })
                .fail( function oAuthSearchFailed()
                {
                    AuthenticationDelegate.fetchLinkedInOauthToken(req, res, next);
                })
        }
        else
            AuthenticationDelegate.fetchLinkedInOauthToken(req, res, next);
    }

    static fetchLinkedInOauthToken(req, res:express.Response, next:Function)
    {
        var cookieData = JSON.parse(req.cookies['linkedin_oauth_' + Credentials.get(Credentials.LINKEDIN_API_KEY)]);

        if (Utils.isNullOrEmpty(cookieData))
            throw(new Error('No Cookie found with Linkedin Data'));

        var accessTokenUrl = 'https://api.linkedin.com/uas/oauth/accessToken';
        var params = {
            xoauth_oauth2_access_token:     cookieData.access_token,
            scope:                          'r_fullprofile+r_emailaddress+r_basicprofile'
        };

        var oAuth = new OAuth.OAuth('', accessTokenUrl,
            Credentials.get(Credentials.LINKEDIN_API_KEY),
            Credentials.get(Credentials.LINKEDIN_API_SECRET),
            '1.0a',
            null, cookieData.signature_method
        );

        oAuth.post(accessTokenUrl, null, null, params, null,function (results, data)
        {
            if (data)
            {
                data = queryString.parse(data);
                var access_token = data.oauth_token;
                var oauth_token_secret = data.oauth_token_secret;
                var expiry = parseInt(data.oauth_expires_in)*1000 + moment().valueOf();

                var fields:string = UserProfileDelegate.BASIC_FIELDS.join(',');

                var oauth = new OAuth.OAuth(
                    'https://www.linkedin.com/uas/oauth/authenticate?oauth_token=',
                    'https://api.linkedin.com/uas/oauth/accessToken',
                    Credentials.get(Credentials.LINKEDIN_API_KEY),
                    Credentials.get(Credentials.LINKEDIN_API_SECRET),
                    '1.0A',
                    null,
                    'HMAC-SHA1'
                );
                oauth.get(
                    'https://api.linkedin.com/v1/people/~:(' + fields + ')?format=json ',
                    access_token,
                    oauth_token_secret,
                    function (e, data, res)
                    {
                        var profile = JSON.parse(data);
                        AuthenticationDelegate.processLinkedInTokens(req,access_token,oauth_token_secret, expiry,profile,next)
                    }
                );
            } else {
                AuthenticationDelegate.logger.error('Likedin access token not returned');
            }
        });
    }

    static fetchDataFromLinkedIn(req:express.Request, res:express.Response, next:Function)
    {
        var self = this;

        var fetchFields = (req.cookies[ApiConstants.LINKEDIN_FETCH_FIELDS] || '').split(':');
        var profileId:number = req.cookies[ApiConstants.USER_PROFILE_ID];
        var userId:number = new User(req[ApiConstants.USER]).getId();

        res.clearCookie(ApiConstants.LINKEDIN_FETCH_FIELDS);

        var userProfileDelegate = new UserProfileDelegate();

        if (!Utils.isNullOrEmpty(fetchFields))
        {
            q.all(_.map(fetchFields, function(field)
                {
                    switch(field)
                    {
                        case ApiConstants.FETCH_PROFILE_PICTURE:
                            return userProfileDelegate.fetchProfilePictureFromLinkedIn(userId, profileId);

                        case ApiConstants.FETCH_BASIC:
                            return userProfileDelegate.fetchBasicDetailsFromLinkedIn(userId, profileId);

                        case ApiConstants.FETCH_EDUCATION:
                            return userProfileDelegate.fetchAndReplaceEducation(userId, profileId);

                        case ApiConstants.FETCH_EMPLOYMENT:
                            return userProfileDelegate.fetchAndReplaceEmployment(userId, profileId);

                        case ApiConstants.FETCH_SKILL:
                            return userProfileDelegate.fetchAndReplaceSkill(userId, profileId);
                    }
                }))
                .then(
                function profileFetched()
                {
                    next();
                },
                function fetchError(error:Error)
                {
                    req.flash('User profile sync with LinkedIn failed. Error: %s', error.message);
                    next();
                });
        }
    }
}
export = AuthenticationDelegate