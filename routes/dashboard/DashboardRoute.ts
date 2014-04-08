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
import MoneyUnit                                        = require('../../enums/MoneyUnit');
import IncludeFlag                                      = require('../../enums/IncludeFlag');
import User                                             = require('../../models/User');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import SMS                                              = require('../../models/SMS');
import Coupon                                           = require('../../models/Coupon');
import UserPhone                                        = require('../../models/UserPhone');
import IntegrationMemberRole                            = require('../../enums/IntegrationMemberRole');
import ApiConstants                                     = require('../../enums/ApiConstants');
import SmsTemplate                                      = require('../../enums/SmsTemplate');
import CallStatus                                       = require('../../enums/CallStatus');
import Utils                                            = require('../../common/Utils');
import Formatter                                        = require('../../common/Formatter');
import VerificationCodeCache                            = require('../../caches/VerificationCodeCache');
import CallFlowMiddleware                               = require('../../routes/callFlow/Middleware');

import Middleware                                       = require('./Middleware');
import Urls                                             = require('./Urls');

class DashboardRoute
{
    static PAGE_LOGIN:string = 'dashboard/login';
    static PAGE_MOBILE_VERIFICATION:string = 'dashboard/mobileVerification';
    static PAGE_INTEGRATIONS:string = 'dashboard/integrations';
    static PAGE_USERS:string = 'dashboard/integrationUsers';
    static PAGE_COUPONS:string = 'dashboard/integrationCoupons';
    static PAGE_PROFILE:string = 'dashboard/memberProfile';

    private integrationDelegate = new IntegrationDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();
    private verificationCodeCache = new VerificationCodeCache();
    private couponDelegate = new CouponDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private notificationDelegate = new NotificationDelegate();

    constructor(app)
    {
        // Pages
        app.get(Urls.index(), connect_ensure_login.ensureLoggedIn(), this.authSuccess.bind(this));
        app.get(Urls.login(), this.login.bind(this));
        app.get(Urls.mobileVerification(), connect_ensure_login.ensureLoggedIn(), this.verifyMobile.bind(this));
        app.get(Urls.integrations(), connect_ensure_login.ensureLoggedIn(), this.integrations.bind(this));
        app.get(Urls.integrationCoupons(), connect_ensure_login.ensureLoggedIn(), this.coupons.bind(this));
        app.get(Urls.integrationMembers(), Middleware.allowOwnerOrAdmin, this.integrationUsers.bind(this));
        app.get(Urls.memberProfile(), Middleware.allowSelf, this.memberProfile.bind(this));
        app.get(Urls.logout(), this.logout.bind(this));
        app.get(Urls.paymentCallback(), this.paymentComplete.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));
        app.post(Urls.memberProfile(), Middleware.allowSelf, this.memberProfileSave.bind(this));
    }

    login(req:express.Request, res:express.Response)
    {
        res.render(DashboardRoute.PAGE_LOGIN, {logged_in_user: req['user'], messages: req.flash()});
    }

    verifyMobile(req:express.Request, res:express.Response)
    {
        this.userPhoneDelegate.getByUserId(req['user'].id)
            .then(
            function phoneNumbersFetched(numbers:UserPhone[]) { return numbers; },
            function phoneNumberFetchError(error) { return null; })
            .then(
            function renderPage(numbers)
            {
                res.render(DashboardRoute.PAGE_MOBILE_VERIFICATION, {userPhones: numbers});
            });
    }

    authSuccess(req:express.Request, res:express.Response)
    {
        var user = req['user'];

        if (req.session['returnTo'])
        {
            res.redirect(req.session['returnTo']);
            return;
        }

        this.integrationMemberDelegate.searchByUser(user.id, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers)
            {
                Middleware.setIntegrationMembers(req, integrationMembers);
                res.redirect(Urls.integrations());
            },
            function integrationsFetchError(error) { res.send(500); });
    }

    integrations(req:express.Request, res:express.Response)
    {
        var user = req['user'];

        this.integrationMemberDelegate.searchByUser(user.id, IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers)
            {
                Middleware.setIntegrationMembers(req, integrationMembers);

                // TODO: Clean up data because we havent implemented foreign keys correctly
                _.each(integrationMembers, function (member:IntegrationMember)
                {
                    var users:User[] = member[IntegrationMember.USER];
                    var integrations:Integration[] = member[IntegrationMember.INTEGRATION];
                    member.setUser(_.findWhere(users, {'id': member.getUserId()}));
                    member.setIntegration(_.findWhere(integrations, {'id': member.getIntegrationId()}));
                });

                var pageData =
                {
                    'members': integrationMembers,
                    'logged_in_user': req['user'],
                    selectedTab: 'integrations'
                };

                res.render(DashboardRoute.PAGE_INTEGRATIONS, pageData);
            },
            function integrationsFetchError(error)
            {
                res.send(500, error);
            });
    }

    private coupons(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        var integration = this.integrationDelegate.getSync(integrationId);
        var integrationMembers = Middleware.getIntegrationMembers(req);

        this.couponDelegate.search({integration_id: integrationId}, Coupon.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_EXPERT])
            .then(
            function couponsFetched(coupons:Coupon[])
            {
                var pageData =
                {
                    'coupons': coupons,
                    'members': integrationMembers,
                    'logged_in_user': req['user'],
                    'integration': integration
                };

                res.render(DashboardRoute.PAGE_COUPONS, pageData);
            },
            function couponFetchError(error) { res.send(500); }
        )
    }

    private integrationUsers(req:express.Request, res:express.Response)
    {
        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        req.session[ApiConstants.INTEGRATION_ID] = integrationId;

        var integrationMembers = Middleware.getIntegrationMembers(req);

        Middleware.setIntegrationId(req, integrationId);

        var member = _.findWhere(integrationMembers, {'integration_id': integrationId});
        var integration = member[IntegrationMember.INTEGRATION];

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

                members = members.concat(_.map(invitedMembers, function (invited) { return new IntegrationMember(invited); }));
                _.each(members, function (member:IntegrationMember)
                {
                    if (Utils.getObjectType(member[IntegrationMember.USER]) == 'Array')
                    // TODO: Implement foreign keys to get rid if this goofiness
                        member[IntegrationMember.USER] = _.findWhere(member[IntegrationMember.USER], {id: member.getUserId()});
                });

                var pageData =
                {
                    'logged_in_user': req['user'],
                    'integrationMembers': members,
                    'integration': integration
                };
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(DashboardRoute.PAGE_USERS, pageData);
            },
            function usersFetchError(error) { res.send(500, error); });
    }

    memberProfile(req:express.Request, res:express.Response)
    {
        var user = req[ApiConstants.USER];
        var integrationId = parseInt(req.session[ApiConstants.INTEGRATION_ID]);
        var integrationMembers = Middleware.getIntegrationMembers(req);
        var member = new IntegrationMember(_.findWhere(integrationMembers, {'user_id': user.id, 'integration_id': integrationId}));

        Middleware.setIntegrationId(req, member.getIntegrationId());

        this.userDelegate.get(user.id)
            .then(
            function userFetched(user)
            {
                var pageData =
                {
                    'logged_in_user': req['user'],
                    'member': member,
                    'user': user
                };
                res.render(DashboardRoute.PAGE_PROFILE, pageData);
            },
            function userFetchError() { res.send(500); }
        );
    }

    memberProfileSave(req:express.Request, res:express.Response)
    {
        var loggedInUser = req['user'];
        var user = req.body[ApiConstants.USER];

        this.userDelegate.update({id: loggedInUser.id}, user)
            .then(
            function userUpdated() { res.send(200); },
            function userUpdateError() { res.send(500); }
        );
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

        // If it's a call
        // 1. Update status to scheduling
        // 2. Send scheduling notification to expert
        this.phoneCallDelegate.update(callId, {status: CallStatus.SCHEDULING})
            .then(
            function callUpdated()
            {
                return self.phoneCallDelegate.get(callId)
            })
            .then(
            function callFetched(call)
            {
                self.notificationDelegate.sendCallSchedulingNotifications(call, CallFlowMiddleware.getAppointments(req));
            });
    }
}

export = DashboardRoute