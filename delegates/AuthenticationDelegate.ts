///<reference path='../_references.d.ts'/>
import _                                    = require('underscore');
import express                              = require('express');
import passport                             = require('passport');
import url                                  = require('url');
import passport_http_bearer                 = require('passport-http-bearer');
import passport_facebook                    = require('passport-facebook');
import passport_linkedin                    = require('passport-linkedin');
import passport_local                       = require('passport-local');
import IntegrationMemberDelegate            = require('../delegates/IntegrationMemberDelegate');
import UserDelegate                         = require('../delegates/UserDelegate');
import UserOAuthDelegate                    = require('../delegates/UserOAuthDelegate');
import UserEmploymentDelegate               = require('../delegates/UserEmploymentDelegate');
import UserEducationDelegate                = require('../delegates/UserEducationDelegate');
import UserSkillDelegate                    = require('../delegates/UserSkillDelegate');
import IntegrationMember                    = require('../models/IntegrationMember');
import UserOauth                            = require('../models/UserOauth');
import User                                 = require('../models/User');
import UserSkill                            = require('../models/UserSkill');
import UserEmployment                       = require('../models/UserEmployment');
import UserEducation                        = require('../models/UserEducation');
import Config                               = require('../common/Config');
import Utils                                = require('../common/Utils');
import ApiConstants                         = require('../enums/ApiConstants');
import IndustryCodes                        = require('../enums/IndustryCodes');

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
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK, url.resolve(Config.get(Config.CORAL_URI), '/login/fb/callback'));
        AuthenticationDelegate.configureFacebookStrategy(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, url.resolve(Config.get(Config.CORAL_URI), '/call/login/fb/callback'));

        /* Linkedin login */
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN, url.resolve(Config.get(Config.CORAL_URI), '/login/linkedin/callback'));
        AuthenticationDelegate.configureLinkedInStrategy(AuthenticationDelegate.STRATEGY_LINKEDIN_EXPERT_REGISTRATION, url.resolve(Config.get(Config.CORAL_URI), ExpertRegistrationUrls.linkedInLoginCallback()));

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
                var userDelegate = new UserDelegate();

                userDelegate.create(user)
                    .then(
                    function userRegistered(user) { req.logIn(user, next) },
                    function registrationError(error)
                    {
                        req.flash('info', error.message);
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
                var userDelegate = new UserDelegate();
                userDelegate.find({email: username}, null, userDelegate.DEFAULT_FIELDS.concat(User.PASSWORD))
                    .then(
                    function authComplete(user)
                    {
                        if (Utils.isNullOrEmpty(user))
                            done(null, false, {message: 'Invalid email'});
                        else if (user.getPassword() != password)
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

                var user:User = new User()
                user.setEmail(profile.email);
                user.setFirstName(profile.first_name);
                user.setLastName(profile.last_name);

                var userOauth = new UserOauth();
                userOauth.setOauthUserId(profile.id);
                userOauth.setProviderId('FB');
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

    private static configureLinkedInStrategy(strategyId:string, callbackUrl:string, profileFields:string[] = ['id', 'first-name', 'last-name', 'email-address', 'headline',
        'industry', 'summary', 'positions', 'picture-url',  'skills', 'educations', 'date-of-birth'])
    {
        passport.use(strategyId, new passport_linkedin.Strategy({
                consumerKey: Config.get(Config.LINKEDIN_API_KEY),
                consumerSecret: Config.get(Config.LINKEDIN_API_SECRET),
                callbackURL: callbackUrl,
                profileFields: profileFields
            },
            function (accessToken, refreshToken, profile:any, done)
            {
                profile = profile['_json'];

                var user:User = new User();
                user.setEmail(profile.emailAddress);
                user.setFirstName(profile.firstName);
                user.setLastName(profile.lastName);
                user.setShortDesc(profile.headline);
                user.setLongDesc(profile.summary);
                if(!Utils.isNullOrEmpty(profile.dateOfBirth))
                {
                    var dob:string = profile.dateOfBirth.day + '-' + profile.dateOfBirth.month + '-' + profile.dateOfBirth.year;
                    user.setDateOfBirth(dob);
                }

                if(!Utils.isNullOrEmpty(profile.industry))
                {
                    var industry:string = profile.industry.toString().replace(/-|\/|\s/g, '_').toUpperCase();
                    user.setIndustry(IndustryCodes[industry]);
                }

                var userOauth = new UserOauth();
                userOauth.setOauthUserId(profile.id);
                userOauth.setProviderId('LinkedIn');
                userOauth.setAccessToken(accessToken);
                userOauth.setRefreshToken(refreshToken);

                new UserOAuthDelegate().addOrUpdateToken(userOauth, user)
                    .then(
                    function tokenUpdated(result:any)
                    {
                        var user = new User(result);
                        return user.isValid() ? done(null, user) : done('Login failed');
                    },
                    function tokenUpdateError(error)
                    {
                        done(error);
                    })
                    .then(
                    function(user:User){
                        var userId:number = user.getId();
                        if(!Utils.isNullOrEmpty(profile.skills))
                        {
                            var userSkill:UserSkill[] = [];
                            if(profile.skills._total > 0)
                            {
                                _.each(profile.skills.values, function(skill){
                                    var tempSkill:UserSkill = new UserSkill();
                                    tempSkill.setSkill(1);//TODO define skillcodes
                                    tempSkill.setUserId(userId);
                                    userSkill.push(tempSkill);
                                })
                                new UserSkillDelegate().create(userSkill)
                            }
                        }

                        if(!Utils.isNullOrEmpty(profile.positions))
                        {
                            var userEmployment:UserEmployment[] = [];
                            if(profile.positions._total > 0)
                            {
                                _.each(profile.positions.values, function(position:any){
                                    var tempUserEmployment:UserEmployment = new UserEmployment();
                                    tempUserEmployment.setIsCurrent(position.isCurrent || false);
                                    tempUserEmployment.setTitle(position.title || null);
                                    tempUserEmployment.setSummary(position.summary || null);
                                    tempUserEmployment.setUserId(userId);

                                    if(!Utils.isNullOrEmpty(position.company))
                                        tempUserEmployment.setCompany(position.company.name || null);
                                    else
                                        tempUserEmployment.setCompany(null);

                                    if(!Utils.isNullOrEmpty(position.startDate))
                                        tempUserEmployment.setStartDate((position.startDate.month  || null) + '-' + (position.startDate.year || null));
                                    else
                                        tempUserEmployment.setStartDate(null);

                                    if(!position.isCurrent && !Utils.isNullOrEmpty(position.endDate))
                                        tempUserEmployment.setEndDate((position.endDate.month  || null) + '-' + (position.endDate.year || null));
                                    else
                                        tempUserEmployment.setEndDate(null);

                                    userEmployment.push(tempUserEmployment);
                                })
                                new UserEmploymentDelegate().create(userEmployment);
                            }
                        }

                        if(!Utils.isNullOrEmpty(profile.educations))
                        {
                            var userEducation:UserEducation[] = [];
                            if(profile.educations._total > 0)
                            {
                                _.each(profile.educations.values, function(education:any){
                                    var tempUserEducation:UserEducation = new UserEducation();
                                    tempUserEducation.setSchoolName(education.schoolName || null);
                                    tempUserEducation.setFieldOfStudy(education.fieldOfStudy || null);
                                    tempUserEducation.setDegree(education.degree || null);
                                    tempUserEducation.setActivities(education.activities || null);
                                    tempUserEducation.setNotes(education.notes || null);
                                    tempUserEducation.setUserId(userId);

                                    if(!Utils.isNullOrEmpty(education.startDate))
                                        tempUserEducation.setStartYear(education.startDate.year || null);
                                    else
                                        tempUserEducation.setStartYear(null);

                                    if(!Utils.isNullOrEmpty(education.endDate))
                                        tempUserEducation.setEndYear(education.endDate.year || null);
                                    else
                                        tempUserEducation.setEndYear(null);

                                    userEducation.push(tempUserEducation);
                                })
                                new UserEducationDelegate().create(userEducation);
                            }
                        }
                    });
            }
        ));
    }
}
export = AuthenticationDelegate