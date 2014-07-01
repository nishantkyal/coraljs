import q                                                = require('q');
import _                                                = require('underscore');
import passport                                         = require('passport');
import express                                          = require('express');
import log4js                                           = require('log4js');
import accounting                                       = require('accounting');
import PricingSchemeDelegate                            = require('../../delegates/PricingSchemeDelegate');
import AuthenticationDelegate                           = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                     = require('../../delegates/UserDelegate');
import IntegrationMemberDelegate                        = require('../../delegates/IntegrationMemberDelegate');
import EmailDelegate                                    = require('../../delegates/EmailDelegate');
import SMSDelegate                                      = require('../../delegates/SMSDelegate');
import CouponDelegate                                   = require('../../delegates/CouponDelegate');
import UserPhoneDelegate                                = require('../../delegates/UserPhoneDelegate');
import PhoneCallDelegate                                = require('../../delegates/PhoneCallDelegate');
import UserEducationDelegate                            = require('../../delegates/UserEducationDelegate');
import UserSkillDelegate                                = require('../../delegates/UserSkillDelegate');
import UserEmploymentDelegate                           = require('../../delegates/UserEmploymentDelegate');
import RefSkillCodeDelegate                             = require('../../delegates/SkillCodeDelegate');
import UserProfileDelegate                              = require('../../delegates/UserProfileDelegate');
import ScheduleRuleDelegate                             = require('../../delegates/ScheduleRuleDelegate');
import VerificationCodeDelegate                         = require('../../delegates/VerificationCodeDelegate');
import MysqlDelegate                                    = require('../../delegates/MysqlDelegate');
import UserUrlDelegate                                  = require('../../delegates/UserUrlDelegate');
import TransactionDelegate                              = require('../../delegates/TransactionDelegate');
import TransactionLineDelegate                          = require('../../delegates/TransactionLineDelegate');
import ExpertiseDelegate                                = require('../../delegates/ExpertiseDelegate');
import WidgetDelegate                                   = require('../../delegates/WidgetDelegate');
import MoneyUnit                                        = require('../../enums/MoneyUnit');
import IncludeFlag                                      = require('../../enums/IncludeFlag');
import TransactionType                                  = require('../../enums/TransactionType');
import ItemType                                         = require('../../enums/ItemType');
import User                                             = require('../../models/User');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import Coupon                                           = require('../../models/Coupon');
import UserPhone                                        = require('../../models/UserPhone');
import PhoneCall                                        = require('../../models/PhoneCall');
import UserProfile                                      = require('../../models/UserProfile');
import Transaction                                      = require('../../models/Transaction');
import TransactionLine                                  = require('../../models/TransactionLine');
import ScheduleRule                                     = require('../../models/ScheduleRule');
import CronRule                                         = require('../../models/CronRule');
import PricingScheme                                    = require('../../models/PricingScheme');
import Expertise                                        = require('../../models/Expertise');
import Widget                                           = require('../../models/Widget');
import IntegrationMemberRole                            = require('../../enums/IntegrationMemberRole');
import ApiConstants                                     = require('../../enums/ApiConstants');
import SmsTemplate                                      = require('../../enums/SmsTemplate');
import CallStatus                                       = require('../../enums/CallStatus');
import IndustryCodes                                    = require('../../enums/IndustryCode');
import Utils                                            = require('../../common/Utils');
import Formatter                                        = require('../../common/Formatter');
import Config                                           = require('../../common/Config');
import PayZippyProvider                                 = require('../../providers/PayZippyProvider');
import CallFlowSessionData                              = require('../../routes/callFlow/SessionData');
import ExpertRegistrationSessionData                    = require('../../routes/expertRegistration/SessionData');

import Middleware                                       = require('./Middleware');
import Urls                                             = require('./Urls');
import SessionData                                      = require('./SessionData');

class DashboardRoute
{
    private static PAGE_LOGIN:string = 'dashboard/login';
    private static PAGE_REGISTER:string = 'dashboard/register';
    private static PAGE_FORGOT_PASSWORD:string = 'dashboard/forgotPassword';
    private static PAGE_MOBILE_VERIFICATION:string = 'dashboard/mobileVerification';
    private static PAGE_DASHBOARD:string = 'dashboard/dashboard';
    private static PAGE_INTEGRATION:string = 'dashboard/integration';
    private static PAGE_PROFILE:string = 'dashboard/userProfile';
    private static PAGE_ACCOUNT_VERIFICATION:string = 'dashboard/accountVerification';
    private static PAGE_SETTING:string = 'dashboard/userSetting';

    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private couponDelegate = new CouponDelegate();
    private userEmploymentDelegate = new UserEmploymentDelegate();
    private userSkillDelegate = new UserSkillDelegate();
    private userEducationDelegate = new UserEducationDelegate();
    private scheduleRuleDelegate = new ScheduleRuleDelegate();
    private pricingSchemeDelegate = new PricingSchemeDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userProfileDelegate = new UserProfileDelegate();
    private userUrlDelegate = new UserUrlDelegate();
    private expertiseDelegate = new ExpertiseDelegate();
    private widgetDelegate = new WidgetDelegate();
    private logger = log4js.getLogger(Utils.getClassName(this));

    constructor(app, secureApp)
    {
        // Pages
        app.get(Urls.index(), AuthenticationDelegate.checkLogin(), this.authSuccess.bind(this));
        app.get(Urls.login(), this.login.bind(this));
        app.get(Urls.register(), this.register.bind(this));
        app.get(Urls.forgotPassword(), this.forgotPassword.bind(this));
        app.get(Urls.mobileVerification(), AuthenticationDelegate.checkLogin({failureRedirect: Urls.index(), setReturnTo: true}), this.verifyMobile.bind(this));

        // Dashboard pages
        app.get(Urls.dashboard(), AuthenticationDelegate.checkLogin({failureRedirect: Urls.login()}), this.dashboard.bind(this));
        app.get(Urls.integration(), AuthenticationDelegate.checkLogin({failureRedirect: Urls.login()}), this.integration.bind(this));
        app.get(Urls.userProfile(), this.userProfile.bind(this));
        app.get(Urls.userSetting(), Middleware.allowOnlyMe, this.setting.bind(this));

        app.get(Urls.logout(), this.logout.bind(this));
        app.get(Urls.emailAccountVerification(), this.emailAccountVerification.bind(this));

        // Fetch profile details from linkedin
        app.get(Urls.userProfileFromLinkedIn(), this.putLinkedInFieldsInSession.bind(this), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, {failureRedirect: Urls.index(),
            failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));
        app.get(Urls.userProfileFromLinkedInCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, {failureRedirect: Urls.index(),
            failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}), this.linkedInCallBack.bind(this));

        // Auth
        app.get(Urls.checkLogin(), AuthenticationDelegate.checkLogin({justCheck: true}));
        app.post(Urls.login(), AuthenticationDelegate.login({failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register({failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));
        app.get(Urls.linkedInLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN, {failureRedirect: Urls.login(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));
        app.get(Urls.linkedInLoginCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN, {failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));
    }

    /* Login page */
    private login(req, res:express.Response)
    {
        var pageData = {
            messages: req.flash()
        };

        res.render(DashboardRoute.PAGE_LOGIN, pageData);
    }

    /* Register page */
    private register(req, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var pageData = _.extend(sessionData.getData(), {
            messages: req.flash()
        });

        res.render(DashboardRoute.PAGE_REGISTER, pageData);
    }

    /* Forgot Password page */
    private forgotPassword(req:express.Request, res:express.Response)
    {
        var code:string = req.query[ApiConstants.CODE];

        var pageData = {
            code: code,
            messages: req.flash()
        };

        res.render(DashboardRoute.PAGE_FORGOT_PASSWORD, pageData);
    }

    /**
     * Mobile Verification page
     * The page has a contextual header so it can be used in multiple places
     */
    private verifyMobile(req:express.Request, res:express.Response)
    {
        this.userPhoneDelegate.find(Utils.createSimpleObject(UserPhone.USER_ID, req[ApiConstants.USER].id))
            .then(
            function phoneNumbersFetched(numbers:UserPhone[]) { return numbers; },
            function phoneNumberFetchError(error) { return null; })
            .then(
            function renderPage(numbers)
            {
                var sessionData:any;
                var context = req.query[ApiConstants.CONTEXT] || 'Dashboard';

                switch (context)
                {
                    case 'expertRegistration':
                        sessionData = new ExpertRegistrationSessionData(req);
                        break;
                    case 'callFlow':
                        sessionData = new CallFlowSessionData(req);
                        break;
                    default:
                        sessionData = new SessionData(req);
                        break;
                }

                var pageData = _.extend(sessionData.getData(), {
                    userPhones: numbers,
                    context: context,
                    messages: req.flash()
                });
                res.render(DashboardRoute.PAGE_MOBILE_VERIFICATION, pageData);
            });
    }

    /**
     * Authentication Success page
     * Renders integrations page by default after fetching all network member entries for the user
     * Returns to returnTo, if set in session
     */
    private authSuccess(req, res:express.Response)
    {
        res.redirect(Urls.dashboard());
    }

    private dashboard(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var pageData = sessionData.getData();
        var userId = parseInt(req[ApiConstants.USER].id);

        q.all([
            self.expertiseDelegate.search(Utils.createSimpleObject(Expertise.USER_ID, userId))
        ])
            .then(
            function dashboardDetailsFetched(...args)
            {
                res.render(DashboardRoute.PAGE_DASHBOARD, pageData);
            })
            .fail(
            function handleError(error)
            {
                res.render('500', {error: error.message});
            });
    }

    /* Integration page */
    private integration(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var selectedIntegrationId = parseInt(req.query[ApiConstants.INTEGRATION_ID]);

        // 1. Get all member entries associated with the user
        // 2. Get coupons and members for the selected integration
        this.integrationMemberDelegate.search({user_id: sessionData.getLoggedInUser().getId()}, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers:IntegrationMember[])
            {
                // TODO: Clean up data because we haven't implemented foreign keys correctly
                var correctedMembers = _.map(integrationMembers, function (member:IntegrationMember)
                {
                    var users:User[] = member[IntegrationMember.USER];
                    var integrations:Integration[] = member[IntegrationMember.INTEGRATION];
                    member.setUser(_.findWhere(users, {'id': member.getUserId()}));
                    member.setIntegration(_.findWhere(integrations, {'id': member.getIntegrationId()}));
                    return member;
                });

                if (correctedMembers.length != 0)
                {
                    var integrationId = selectedIntegrationId || correctedMembers[0].getIntegrationId();

                    return [integrationId, correctedMembers, q.all([
                        self.integrationMemberDelegate.search({integration_id: integrationId}, IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]),
                        self.verificationCodeDelegate.getInvitationCodes(integrationId),
                        self.couponDelegate.search({integration_id: integrationId}, Coupon.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_EXPERT])
                    ])];
                }
                else
                    throw new Error("You've not joined any network yet.")
            })
            .spread(
            function integrationDetailsFetched(integrationId:number, members:IntegrationMember[], ...results)
            {
                self.logger.debug('Data fetched for network page');

                var integrationMembers = results[0][0];
                var invitedMembers = [].concat(_.values(results[0][1]));
                var coupons = results[0][2];

                _.each(integrationMembers, function (member:IntegrationMember)
                {
                    // TODO: Implement foreign keys to get rid of this goofiness
                    if (Utils.getObjectType(member[IntegrationMember.USER]) == 'Array')
                        member[IntegrationMember.USER] = _.findWhere(member[IntegrationMember.USER], {id: member.getUserId()});
                });

                integrationMembers = integrationMembers.concat(_.map(invitedMembers, function (invited) { return new IntegrationMember(invited); }));

                var pageData = _.extend(sessionData.getData(), {
                    'members': members,
                    'selectedMember': _.findWhere(members, {'integration_id': integrationId}),
                    'integrationMembers': integrationMembers,
                    'coupons': coupons
                });

                //self.logger.debug('Rendering network page, data: %s', JSON.stringify(pageData));
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(DashboardRoute.PAGE_INTEGRATION, pageData);
            })
            .fail(
            function handleFailure(error)
            {
                res.render('500', {error: error.message});
            });
    }

    /* Member Profile page */
    private userProfile(req:express.Request, res:express.Response)
    {
        var self = this;
        var userId = parseInt(req.params[ApiConstants.USER_ID]);
        var mode = req.query[ApiConstants.MODE];
        var sessionData = new SessionData(req);
        var member:IntegrationMember;
        var loggedInUser = sessionData.getLoggedInUser();

        self.userProfileDelegate.find(Utils.createSimpleObject(UserProfile.USER_ID, userId))
            .then(
            function profileFetched(userProfile:UserProfile)
            {
                var profileInfoTasks = [self.userDelegate.get(userId)];

                if (!Utils.isNullOrEmpty(userProfile) && userProfile.getId())
                    profileInfoTasks = profileInfoTasks.concat([
                        self.userSkillDelegate.getSkillWithName(userProfile.getId()),
                        self.userEducationDelegate.search({'profileId': userProfile.getId()}),
                        self.userEmploymentDelegate.search({'profileId': userProfile.getId()}),
                        self.userUrlDelegate.search({'profileId': userProfile.getId()}),
                        self.expertiseDelegate.search(Utils.createSimpleObject(Expertise.USER_ID, userId))
                    ]);

                return [userProfile, q.all(profileInfoTasks)];
            })
            .spread(
            function userDetailsFetched(userProfile, ...args)
            {
                var user = args[0][0];
                var userSkill = args[0][1] || [];
                var userEducation = args[0][2] || [];
                var userEmployment = args[0][3] || [];
                var userUrl = args[0][4] || [];
                var expertise = args[0][5] || [];

                var isEditable = loggedInUser ? loggedInUser.getId() == user.getId() : false;

                if (mode == ApiConstants.PUBLIC_MODE)
                    isEditable = false;

                var profileId = userProfile ? userProfile.getId() : null;

                var pageData = _.extend(sessionData.getData(), {
                    'profileId': profileId,
                    'member': member,
                    'user': user,
                    'userSkill': _.sortBy(userSkill, function (skill) { return skill['skill_name'].length; }),
                    'userProfile': userProfile,
                    'userEducation': userEducation,
                    'userEmployment': userEmployment,
                    'userExpertise': expertise,
                    'userUrl': userUrl,
                    'messages': req.flash(),
                    'isEditable': isEditable
                });
                res.render(DashboardRoute.PAGE_PROFILE, pageData);
            },
            function memberDetailsFetchError(error)
            {
                res.render('500', {error: error});
            });
    }

    setting(req:express.Request, res:express.Response)
    {
        var self = this;
        var userId:number = parseInt(req.params[ApiConstants.USER_ID]);
        var sessionData = new SessionData(req);

        q.all([
            self.scheduleRuleDelegate.getRulesByUser(userId),
            self.pricingSchemeDelegate.search(Utils.createSimpleObject(PricingScheme.USER_ID, userId)),
            self.userPhoneDelegate.search(Utils.createSimpleObject(UserPhone.USER_ID, userId)),
            self.widgetDelegate.search(Utils.createSimpleObject(Widget.USER_ID, userId))
        ])
            .then(function detailsFetched(...args)
            {
                var rules:ScheduleRule[] = [].concat(args[0][0]);
                var pricingSchemes:PricingScheme[] = args[0][1];
                var userPhone:UserPhone[] = args[0][2] || [new UserPhone()];
                var widget:Widget[] = _.sortBy(args[0][3] || [], function (w:any) {return w.template});

                _.each(rules || [], function (rule:ScheduleRule)
                {
                    rule['values'] = CronRule.getValues(rule.getCronRule())
                });

                var pageData = _.extend(sessionData.getData(), {
                    userPhone: userPhone[0],
                    rules: rules || [],
                    scheme: pricingSchemes ? pricingSchemes[0] : new PricingScheme(),
                    widgets: widget || []
                });

                res.render(DashboardRoute.PAGE_SETTING, pageData);
            })
            .fail(
            function (error)
            {
                res.render('500', error.message)
            });
    }

    /* Logout and redirect to login page */
    private logout(req, res:express.Response)
    {
        req.logout();
        req.session.destroy();
        setTimeout(res.redirect(req.query[ApiConstants.RETURN_TO] || Urls.index()), 2000);
    }

    private emailAccountVerification(req, res:express.Response)
    {
        var self = this;
        var code:string = req.query[ApiConstants.CODE];
        var email:string = req.query[ApiConstants.EMAIL];

        if (Utils.isNullOrEmpty(code) || Utils.isNullOrEmpty(email))
            return res.render('500', {error: 'Invalid code or email'});

        this.verificationCodeDelegate.verifyEmailVerificationCode(code, email)
            .then(
            function verified(result:boolean):any
            {
                if (result)
                {
                    var userActivationUpdate = {};
                    userActivationUpdate[User.ACTIVE] =
                        userActivationUpdate[User.EMAIL_VERIFIED] = true;
                    return self.userDelegate.update(Utils.createSimpleObject(User.EMAIL, email), userActivationUpdate);
                }
                else
                    return res.render('500', {error: 'Account verification failed. Invalid code or email'});
            })
            .then(
            function userActivated()
            {
                return res.render(DashboardRoute.PAGE_ACCOUNT_VERIFICATION);
            })
            .then(
            function responseSent()
            {
                return self.verificationCodeDelegate.deleteEmailVerificationCode(email);
            })
            .fail(
            function verificationFailed(error)
            {
                res.render('500', {error: error.message});
            });
    }

    private linkedInCallBack(req:express.Request, res:express.Response)
    {
        var self = this;

        var fetchFields = req.session[ApiConstants.LINKEDIN_FETCH_FIELDS];
        var profileId:number = req.session[ApiConstants.USER_PROFILE_ID];
        var userId:number = req.session[ApiConstants.USER_ID];

        var fetchTasks = [];

        if (fetchFields[ApiConstants.FETCH_PROFILE_PICTURE])
            fetchTasks.push(self.userProfileDelegate.fetchProfilePictureFromLinkedIn(userId, profileId));

        if (fetchFields[ApiConstants.FETCH_BASIC])
            fetchTasks.push(self.userProfileDelegate.fetchBasicDetailsFromLinkedIn(userId, profileId));

        if (fetchFields[ApiConstants.FETCH_EDUCATION])
            fetchTasks.push(self.userProfileDelegate.fetchAndReplaceEducation(userId, profileId));

        if (fetchFields[ApiConstants.FETCH_EMPLOYMENT])
            fetchTasks.push(self.userProfileDelegate.fetchAndReplaceEmployment(userId, profileId));

        if (fetchFields[ApiConstants.FETCH_SKILL])
            fetchTasks.push(self.userProfileDelegate.fetchAndReplaceSkill(userId, profileId));

        q.all(fetchTasks)
            .then(
            function profileFetched(...args)
            {
                res.redirect(Urls.userProfile(userId));
            },
            function fetchError(error)
            {
                res.send(500);
            });
    }

    private putLinkedInFieldsInSession(req:express.Request, res:express.Response, next:Function)
    {
        var profileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);
        var fetchBasic:boolean = req.query[ApiConstants.FETCH_BASIC] == 'on' ? true : false;
        var fetchEducation:boolean = req.query[ApiConstants.FETCH_EDUCATION] == 'on' ? true : false;
        var fetchEmployment:boolean = req.query[ApiConstants.FETCH_EMPLOYMENT] == 'on' ? true : false;
        var fetchProfilePicture:boolean = req.query[ApiConstants.FETCH_PROFILE_PICTURE] == 'on' ? true : false;
        var fetchSkill:boolean = req.query[ApiConstants.FETCH_SKILL] == 'on' ? true : false;
        req.session[ApiConstants.LINKEDIN_FETCH_FIELDS] = {fetchBasic: fetchBasic, fetchEducation: fetchEducation, fetchEmployment: fetchEmployment, fetchProfilePicture: fetchProfilePicture, fetchSkill: fetchSkill};
        req.session[ApiConstants.USER_PROFILE_ID] = profileId;
        req.session[ApiConstants.USER_ID] = parseInt(req.query[ApiConstants.USER_ID]);
        next();
    }
}

export = DashboardRoute