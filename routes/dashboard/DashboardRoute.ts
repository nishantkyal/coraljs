///<reference path='../../_references.d.ts'/>
import q                                                = require('q');
import _                                                = require('underscore');
import passport                                         = require('passport');
import connect_ensure_login                             = require('connect-ensure-login');
import express                                          = require('express');
import log4js                                           = require('log4js');
import accounting                                       = require('accounting');
import ApiUrlDelegate                                   = require('../../delegates/ApiUrlDelegate');
import AuthenticationDelegate                           = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                     = require('../../delegates/UserDelegate');
import IntegrationDelegate                              = require('../../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                        = require('../../delegates/IntegrationMemberDelegate');
import EmailDelegate                                    = require('../../delegates/EmailDelegate');
import SMSDelegate                                      = require('../../delegates/SMSDelegate');
import CouponDelegate                                   = require('../../delegates/CouponDelegate');
import UserPhoneDelegate                                = require('../../delegates/UserPhoneDelegate');
import PhoneCallDelegate                                = require('../../delegates/PhoneCallDelegate');
import NotificationDelegate                             = require('../../delegates/NotificationDelegate');
import UserEducationDelegate                            = require('../../delegates/UserEducationDelegate');
import UserSkillDelegate                                = require('../../delegates/UserSkillDelegate');
import UserEmploymentDelegate                           = require('../../delegates/UserEmploymentDelegate');
import RefSkillCodeDelegate                             = require('../../delegates/SkillCodeDelegate');
import VerificationCodeDelegate                         = require('../../delegates/VerificationCodeDelegate');
import MoneyUnit                                        = require('../../enums/MoneyUnit');
import IncludeFlag                                      = require('../../enums/IncludeFlag');
import User                                             = require('../../models/User');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import SMS                                              = require('../../models/SMS');
import Coupon                                           = require('../../models/Coupon');
import UserPhone                                        = require('../../models/UserPhone');
import PhoneCall                                        = require('../../models/PhoneCall');
import IntegrationMemberRole                            = require('../../enums/IntegrationMemberRole');
import ApiConstants                                     = require('../../enums/ApiConstants');
import SmsTemplate                                      = require('../../enums/SmsTemplate');
import CallStatus                                       = require('../../enums/CallStatus');
import IndustryCodes                                    = require('../../enums/IndustryCode');
import Utils                                            = require('../../common/Utils');
import Formatter                                        = require('../../common/Formatter');
import VerificationCodeCache                            = require('../../caches/VerificationCodeCache');

import CallFlowSessionData                              = require('../../routes/callFlow/SessionData');

import Middleware                                       = require('./Middleware');
import Urls                                             = require('./Urls');
import SessionData                                      = require('./SessionData');

class DashboardRoute
{
    private static PAGE_LOGIN:string = 'dashboard/login';
    private static PAGE_MOBILE_VERIFICATION:string = 'dashboard/mobileVerification';
    private static PAGE_INTEGRATIONS:string = 'dashboard/integrations';
    private static PAGE_USERS:string = 'dashboard/integrationUsers';
    private static PAGE_COUPONS:string = 'dashboard/integrationCoupons';
    private static PAGE_PROFILE:string = 'dashboard/memberProfile';
    private static PAGE_PROFILE_COMPLETE:string = 'dashboard/memberProfileComplete';
    private static PAGE_EDUCATION:string = 'dashboard/memberEducation';
    private static PAGE_SKILL:string = 'dashboard/memberSkill';
    private static PAGE_EMPLOYMENT:string = 'dashboard/memberEmployment';
    private static PAGE_ACCOUNT_VERIFICATION:string = 'dashboard/accountVerification';

    private integrationDelegate = new IntegrationDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();
    private verificationCodeCache = new VerificationCodeCache();
    private couponDelegate = new CouponDelegate();
    private userEmploymentDelegate = new UserEmploymentDelegate();
    private userSkillDelegate = new UserSkillDelegate();
    private userEducationDelegate = new UserEducationDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private notificationDelegate = new NotificationDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();

    constructor(app, secureApp)
    {
        // Pages
        app.get(Urls.index(), connect_ensure_login.ensureLoggedIn(), this.authSuccess.bind(this));
        app.get(Urls.login(), this.login.bind(this));
        app.get(Urls.mobileVerification(), connect_ensure_login.ensureLoggedIn(), this.verifyMobile.bind(this));
        app.get(Urls.integrations(), connect_ensure_login.ensureLoggedIn(), this.integrations.bind(this));
        app.get(Urls.integrationCoupons(), connect_ensure_login.ensureLoggedIn(), this.coupons.bind(this));
        app.get(Urls.integrationMembers(), Middleware.allowOwnerOrAdmin, this.integrationUsers.bind(this));
        app.get(Urls.memberProfile(), Middleware.allowSelf, this.memberProfile.bind(this));
        app.get(Urls.memberProfileComplete(), this.memberProfileComplete.bind(this));
        app.get(Urls.memberEducation(), Middleware.allowSelf, this.memberEducation.bind(this));
        app.get(Urls.memberEmployment(), Middleware.allowSelf, this.memberEmployment.bind(this));
        app.get(Urls.logout(), this.logout.bind(this));
        app.get(Urls.paymentCallback(), this.paymentComplete.bind(this));
        app.get(Urls.emailAccountVerification(), this.emailAccountVerification.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));
        app.post(Urls.memberProfile(), Middleware.allowSelf, this.memberProfileSave.bind(this));
    }

    login(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var pageData = _.extend(sessionData.getData(), {
            messages: req.flash()
        });

        res.render(DashboardRoute.PAGE_LOGIN, pageData);
    }

    verifyMobile(req:express.Request, res:express.Response)
    {
        this.userPhoneDelegate.getByUserId(req[ApiConstants.USER].id)
            .then(
            function phoneNumbersFetched(numbers:UserPhone[]) { return numbers; },
            function phoneNumberFetchError(error) { return null; })
            .then(
            function renderPage(numbers)
            {
                var sessionData = new SessionData(req);
                var pageData = _.extend(sessionData.getData(), {
                    userPhones: numbers,
                    context: req.query[ApiConstants.CONTEXT]
                });
                res.render(DashboardRoute.PAGE_MOBILE_VERIFICATION, pageData);
            });
    }

    authSuccess(req, res:express.Response)
    {
        var sessionData = new SessionData(req);

        if (req.session[ApiConstants.RETURN_TO])
        {
            res.redirect(req.session[ApiConstants.RETURN_TO]);
            req.session[ApiConstants.RETURN_TO] = null;
            return;
        }

        this.integrationMemberDelegate.search({user_id: sessionData.getLoggedInUser().getId()}, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers)
            {
                if (Utils.isNullOrEmpty(integrationMembers))
                {
                    req.logout();
                    res.send(401, 'Seems like you don\'t have an account yet.');
                }
                else
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

                    sessionData.setMembers(correctedMembers);
                    res.redirect(Urls.integrations());
                }
            },
            function integrationsFetchError(error)
            {
                res.send(500);
            }
        );
    }

    integrations(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var pageData = _.extend(sessionData.getData(), {
            selectedTab: 'integrations'
        });

        res.render(DashboardRoute.PAGE_INTEGRATIONS, pageData);
    }

    private coupons(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        var integration = this.integrationDelegate.getSync(integrationId);

        this.couponDelegate.search({integration_id: integrationId}, Coupon.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_EXPERT])
            .then(
            function couponsFetched(coupons:Coupon[])
            {
                var pageData = _.extend(sessionData.getData(),  {
                    'coupons': coupons,
                    'integration': integration
                });

                res.render(DashboardRoute.PAGE_COUPONS, pageData);
            },
            function couponFetchError(error) { res.send(500); }
        )
    }

    private integrationUsers(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        var integration = this.integrationDelegate.getSync(integrationId);
        sessionData.setIntegrationId(integrationId);

        // Fetch all users for integration
        var search = {};
        search[IntegrationMember.INTEGRATION_ID] = integrationId;

        q.all([
            this.integrationMemberDelegate.search(search, IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]),
            this.verificationCodeCache.getInvitationCodes(integrationId)
        ])
            .then(
            function membersFetched(...results)
            {
                var members = results[0][0];
                var invitedMembers = [].concat(results[0][1]);

                _.each(members, function (member:IntegrationMember)
                {
                    if (Utils.getObjectType(member[IntegrationMember.USER]) == 'Array')
                    // TODO: Implement foreign keys to get rid if this goofiness
                        member[IntegrationMember.USER] = _.findWhere(member[IntegrationMember.USER], {id: member.getUserId()});
                });

                // Mark members who have an expert entry as well as an invited entry as inactive
                // since this means they haven't completed the registration process

                _.each(invitedMembers, function (invitedMember)
                {
                    var expertEntry = _.find(members, function (member:IntegrationMember)
                    {
                        return invitedMember['user']['first_name'] == member.getUser().getFirstName()
                            && invitedMember['user']['last_name'] == member.getUser().getLastName();
                    });

                    if (!Utils.isNullOrEmpty(expertEntry))
                        invitedMember.user['status'] = 'Registered';
                });

                members = members.concat(_.map(invitedMembers, function (invited) { return new IntegrationMember(invited); }));

                var pageData = _.extend(sessionData.getData(), {
                    'members': members,
                    'integration': integration
                });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(DashboardRoute.PAGE_USERS, pageData);
            },
            function usersFetchError(error) { res.send(500, error); });
    }

    memberProfileComplete(req:express.Request, res:express.Response)
    {
        var self = this;
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);
        var sessionData = new SessionData(req);

        self.integrationMemberDelegate.get(memberId)
            .then(
            function memberFetched(member:IntegrationMember)
            {
                var userId = member.getUserId();
                return q.all([
                    self.userDelegate.get(userId),
                    self.userSkillDelegate.getSkillName(userId),
                    self.userEducationDelegate.search({'user_id': userId}),
                    self.userEmploymentDelegate.search({'user_id': userId})
                ]);
            })
            .then(
            function (...args)
            {
                var user = args[0][0];
                var userSkill = args[0][1];
                var userEducation = args[0][2];
                var userEmployment = args[0][3];

                var pageData = _.extend(sessionData.getData(),  {
                    'user': user,
                    'userSkill': userSkill,
                    'userEducation': userEducation,
                    'userEmployment': userEmployment
                });

                res.render(DashboardRoute.PAGE_PROFILE_COMPLETE, pageData);
            })
            .fail(
            function (error)
            {
                res.send(500);
            });
    }

    memberProfile(req:express.Request, res:express.Response)
    {
        var self = this;
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);
        var user:any = req[ApiConstants.USER];
        var sessionData = new SessionData(req);

        q.all([
            self.userSkillDelegate.getSkillName(user.id),
            self.integrationMemberDelegate.get(memberId)
        ])
            .then(
            function memberDetailsFetched(...args)
            {
                var skills = args[0][0];
                var member = args[0][1];

                var pageData = _.extend(sessionData.getData(), {
                    'member': member,
                    'skills': skills
                });
                res.render(DashboardRoute.PAGE_PROFILE, pageData);
            },
            function userSkillFetchError(error) { res.send(500); });
    }

    memberProfileSave(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var user = req.body[ApiConstants.USER];

        this.userDelegate.update({id: sessionData.getLoggedInUser().getId()}, user)
            .then(
            function userUpdated() { res.send(200); },
            function userUpdateError() { res.send(500); }
        );
    }

    memberEducation(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);

        q.all([
            self.userEducationDelegate.search({'user_id': sessionData.getLoggedInUser().getId()}),
            self.integrationMemberDelegate.get(memberId)
        ])
            .then(
            function memberDetailsFetched(...args)
            {
                var userEducation = args[0][0];
                var member = args[0][1];

                var pageData = _.extend(sessionData.getData(), {
                    'member': member,
                    'userEducation': userEducation
                });

                res.render(DashboardRoute.PAGE_EDUCATION, pageData);
            },
            function userEducationFetchError() { res.send(500); }
        )
    }

    memberEmployment(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);

        q.all([
            self.userEmploymentDelegate.search({'user_id': sessionData.getLoggedInUser().getId()}),
            self.integrationMemberDelegate.get(memberId)
        ])
            .then(
            function memberDetailsFetched(...args)
            {
                var userEmployment = args[0][0];
                var member = args[0][1];

                var pageData = _.extend(sessionData.getData(), {
                    'member': member,
                    'userEmployment': userEmployment
                });

                res.render(DashboardRoute.PAGE_EMPLOYMENT, pageData);
            },
            function userEducationFetchError() { res.send(500); }
        )
    }

    logout(req, res)
    {
        req.logout();
        res.redirect(Urls.index());
    }

    /* Handle payment response from gateway */
    private paymentComplete(req:express.Request, res:express.Response)
    {
        var callId:number = null;
        var self = this;

        callId = req.session[ApiConstants.PHONE_CALL_ID]; //TODO remove this and get callId from transaction

        // If it's a call
        // 1. Update status to scheduling
        // 2. Send scheduling notification to expert
        this.phoneCallDelegate.update(callId, {status: CallStatus.SCHEDULING})
            .then(
            function callUpdated()
            {
                return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);
            })
            .then(
            function callFetched(call:PhoneCall)
            {
                var callFlowSessionData = new CallFlowSessionData(req);
                self.notificationDelegate.sendCallSchedulingNotifications(call, callFlowSessionData.getAppointments(), callFlowSessionData.getDuration(), callFlowSessionData.getLoggedInUser());
            });
    }

    private emailAccountVerification(req:express.Request, res:express.Response)
    {
        var self = this;
        var code:string = req.query[ApiConstants.CODE];
        var email:string = req.query[ApiConstants.EMAIL];

        if (Utils.isNullOrEmpty(code) || Utils.isNullOrEmpty(email))
        {
            res.send(400, 'Invalid code or email');
            return;
        }

        this.verificationCodeDelegate.verifyAccountVerificationCode(email, code)
            .then(
            function verified(result):any
            {
                if (result)
                {
                    res.send(200, 'Account activated!');
                    return email;
                }
                else
                    res.send(401, 'Account verification failed. Invalid code or email');
            },
            function verificationFailed(error) { res.send(500); })
            .then(
            function responseSent()
            {
                return self.userDelegate.recalculateStatus({email: email});
            })
            .then(
            function statusUpdated()
            {
                return self.verificationCodeDelegate.deleteAccountVerificationCode(email);
            });
    }
}

export = DashboardRoute