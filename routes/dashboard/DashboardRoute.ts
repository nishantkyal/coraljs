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
import IntegrationDelegate                              = require('../../delegates/IntegrationDelegate');
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
    private static PAGE_HOME:string = 'dashboard/home';
    private static PAGE_SNS:string = 'dashboard/sns';
    private static PAGE_FORGOT_PASSWORD:string = 'dashboard/forgotPassword';
    private static PAGE_MOBILE_VERIFICATION:string = 'dashboard/mobileVerification';
    private static PAGE_DASHBOARD:string = 'dashboard/dashboard';
    private static PAGE_INTEGRATION:string = 'dashboard/integration';
    private static PAGE_PROFILE:string = 'dashboard/userProfile';
    private static PAGE_PAYMENTS:string = 'dashboard/payment';
    private static PAGE_ACCOUNT_VERIFICATION:string = 'dashboard/accountVerification';
    private static PAGE_SETTING_PHONE:string = 'dashboard/userSettingPhone';
    private static PAGE_SETTING_SCHEDULE:string = 'dashboard/userSettingSchedule';
    private static PAGE_SETTING_PASSWORD:string = 'dashboard/userSettingPassword';
    private static PAGE_WIDGET_CREATOR:string = 'dashboard/widgetCreator';

    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private integrationDelegate = new IntegrationDelegate();
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
        app.get(Urls.index(), AuthenticationDelegate.checkLogin({failureRedirect: Urls.home()}), this.dashboard.bind(this));
        app.get(Urls.home(), this.home.bind(this));
        app.get(Urls.sns(), this.sns.bind(this));
        app.get(Urls.forgotPassword(), this.forgotPassword.bind(this));
        app.get(Urls.mobileVerification(), AuthenticationDelegate.checkLogin({failureRedirect: Urls.index(), setReturnTo: true}), this.verifyMobile.bind(this));

        // Dashboard pages
        app.get(Urls.dashboard(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.dashboard.bind(this));
        app.get(Urls.integration(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.integration.bind(this));
        app.get(Urls.userProfile(), this.userProfile.bind(this));
        app.get(Urls.payments(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.userPayments.bind(this));
        app.get(Urls.userSettingPhone(), Middleware.allowOnlyMe, this.settingPhone.bind(this));
        app.get(Urls.userSettingSchedule(), Middleware.allowOnlyMe, this.settingSchedule.bind(this));
        app.get(Urls.userSettingPassword(), Middleware.allowOnlyMe, this.settingPassword.bind(this));

        app.get(Urls.emailAccountVerification(), this.emailAccountVerification.bind(this));
        app.get(Urls.widgetCreator(), this.widgetCreator.bind(this));
    }
    private sns(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);

        q.all([
                self.integrationDelegate.get(integrationId),
                self.integrationMemberDelegate.search({'integration_id':integrationId,'role':IntegrationMemberRole.Expert})
            ])
            .then(
            function detailsFetched(...args)
            {
                var integration = args[0][0];
                var members = args[0][1];
                var tasks = _.map(members, function(member:IntegrationMember){
                    return self.userDelegate.find({'id':member.getUserId()},null,[IncludeFlag.INCLUDE_PRICING_SCHEMES, IncludeFlag.INCLUDE_SKILL, IncludeFlag.INCLUDE_SCHEDULES, IncludeFlag.INCLUDE_USER_PROFILE]);
                });

                return [integration,q.all(tasks)];
            })
            .spread(function expertDetailsFetched(integration,...args)
            {
                var pageData = _.extend(sessionData.getData(), {
                    integration:integration,
                    experts:args[0]
                });

                res.render(DashboardRoute.PAGE_SNS, pageData);
            })
            .fail (
            function integrationFetchError(error)
            {
                res.render('500',{error:error});
            })
    }

    private home(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var pageData = _.extend(sessionData.getData(), {
            messages: req.flash()
        });

        res.render(DashboardRoute.PAGE_HOME, pageData);
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
            function renderPage(numbers:UserPhone[])
            {
                var sessionData = new SessionData(req);

                var pageData = _.extend(sessionData.getData(), {
                    userPhones: numbers,
                    messages: req.flash()
                });
                res.render(DashboardRoute.PAGE_MOBILE_VERIFICATION, pageData);
            })
            .fail(
            function handleError(error)
            {
                res.render('500', {error: error.message});
            });
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
        var createIntegration = req.query[ApiConstants.CREATE_INTEGRATION] == 'true';

        // 1. Get all member entries associated with the user
        // 2. Get coupons and members for the selected integration
        this.integrationMemberDelegate.search({user_id: sessionData.getLoggedInUser().getId()}, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers:IntegrationMember[])
            {
                if (!Utils.isNullOrEmpty(integrationMembers))
                {
                    var integrationId = selectedIntegrationId || integrationMembers[0].getIntegrationId();

                    return [integrationId, integrationMembers, q.all([
                        self.integrationMemberDelegate.search({integration_id: integrationId}, IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]),
                        self.verificationCodeDelegate.getInvitationCodes(integrationId),
                        self.couponDelegate.search({integration_id: integrationId}, Coupon.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_EXPERT]),
                        self.integrationDelegate.get(integrationId)
                    ])];
                }
                else
                    return [null, [], [[],[],[],{}]];
            })
            .spread(
            function integrationDetailsFetched(integrationId:number, members:IntegrationMember[], ...results)
            {
                self.logger.debug('Data fetched for network page');

                var integrationMembers = results[0][0];
                var invitedMembers = [].concat(_.values(results[0][1]));
                var coupons = results[0][2] || [];
                var integration = results[0][3];

                var isPartOfDefaultNetwork = !Utils.isNullOrEmpty(_.findWhere(members, Utils.createSimpleObject(IntegrationMember.INTEGRATION_ID, Config.get(Config.DEFAULT_NETWORK_ID))));
                integrationMembers = integrationMembers.concat(_.map(invitedMembers, function (invited) { return new IntegrationMember(invited); }));

                var pageData = _.extend(sessionData.getData(), {
                    'members': members,
                    'selectedMember': _.findWhere(members, {'integration_id': integrationId}),
                    'integrationMembers': integrationMembers,
                    'coupons': coupons,
                    integration: integration,
                    createIntegration: createIntegration,
                    isPartOfDefaultNetwork: isPartOfDefaultNetwork
                });

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
                var profileInfoTasks = [self.userDelegate.get(userId,null, [IncludeFlag.INCLUDE_SKILL, IncludeFlag.INCLUDE_EDUCATION, IncludeFlag.INCLUDE_EMPLOYMENT])];

                if (!Utils.isNullOrEmpty(userProfile) && userProfile.getId())
                    profileInfoTasks = profileInfoTasks.concat([
                        self.expertiseDelegate.search(Utils.createSimpleObject(Expertise.USER_ID, userId), null, [IncludeFlag.INCLUDE_SKILL])
                    ]);

                return [userProfile, q.all(profileInfoTasks)];
            })
            .spread(
            function userDetailsFetched(userProfile,...args)
            {
                var user = args[0][0];
                var expertise = args[0][4] || [];

                var isEditable = loggedInUser ? loggedInUser.getId() == user.getId() : false;

                if (mode == ApiConstants.PUBLIC_MODE)
                    isEditable = false;

                var profileId = userProfile ? userProfile.getId() : null;

                var pageData = _.extend(sessionData.getData(), {
                    'profileId': profileId,
                    'member': member,
                    'user': user,
                    //'userSkill': _.sortBy(userSkill, function (skill) { return skill['skill_name'].length; }),
                    'userProfile': userProfile,
                    'userExpertise': expertise,
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

    userPayments(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var pageData = _.extend(sessionData.getData(), {

        });
        res.render(DashboardRoute.PAGE_PAYMENTS, pageData);
    }

    settingPhone(req:express.Request, res:express.Response)
    {
        var self = this;
        var userId:number = parseInt(req.params[ApiConstants.USER_ID]);
        var sessionData = new SessionData(req);

        q.all([
            self.userPhoneDelegate.search(Utils.createSimpleObject(UserPhone.USER_ID, userId))
        ])
            .then(function detailsFetched(...args)
            {
                var userPhone:UserPhone[] = args[0][2];

                var pageData = _.extend(sessionData.getData(), {
                    userPhone: userPhone
                });

                res.render(DashboardRoute.PAGE_SETTING_PHONE, pageData);
            })
            .fail(
            function (error)
            {
                res.render('500', error.message)
            });
    }

    settingSchedule(req:express.Request, res:express.Response)
    {
        var self = this;
        var userId:number = parseInt(req.params[ApiConstants.USER_ID]);
        var sessionData = new SessionData(req);

        q.all([
            self.scheduleRuleDelegate.getRulesByUser(userId),
            self.pricingSchemeDelegate.search(Utils.createSimpleObject(PricingScheme.USER_ID, userId))
        ])
            .then(function detailsFetched(...args)
            {
                var rules:ScheduleRule[] = [].concat(args[0][0]);
                var pricingSchemes:PricingScheme[] = args[0][1];

                _.each(rules || [], function (rule:ScheduleRule)
                {
                    rule['values'] = CronRule.getValues(rule.getCronRule())
                });

                var pageData = _.extend(sessionData.getData(), {
                    rules: rules || [],
                    scheme: pricingSchemes ? pricingSchemes[0] : new PricingScheme()
                });

                res.render(DashboardRoute.PAGE_SETTING_SCHEDULE, pageData);
            })
            .fail(
            function (error)
            {
                res.render('500', error.message)
            });
    }

    settingPassword(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var pageData = sessionData.getData();
        res.render(DashboardRoute.PAGE_SETTING_PASSWORD, pageData);
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
                if (req.isAuthenticated() && req[ApiConstants.USER][User.EMAIL] === email)
                {
                    req[ApiConstants.USER][User.ACTIVE] = true;
                    req[ApiConstants.USER][User.EMAIL_VERIFIED] = true;
                }
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

    private widgetCreator(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var pageData = _.extend(sessionData.getData(), {
            'allowedVerbs': WidgetDelegate.ALLOWED_VERBS
        });
        res.render(DashboardRoute.PAGE_WIDGET_CREATOR, pageData);
    }
}

export = DashboardRoute