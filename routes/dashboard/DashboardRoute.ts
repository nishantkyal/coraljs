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
import UserEducationDelegate                            = require('../../delegates/UserEducationDelegate');
import UserSkillDelegate                                = require('../../delegates/UserSkillDelegate');
import UserEmploymentDelegate                           = require('../../delegates/UserEmploymentDelegate');
import RefSkillCodeDelegate                             = require('../../delegates/SkillCodeDelegate');
import MoneyUnit                                        = require('../../enums/MoneyUnit');
import IncludeFlag                                      = require('../../enums/IncludeFlag');
import User                                             = require('../../models/User');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import SMS                                              = require('../../models/SMS');
import Coupon                                           = require('../../models/Coupon');
import IntegrationMemberRole                            = require('../../enums/IntegrationMemberRole');
import ApiConstants                                     = require('../../enums/ApiConstants');
import SmsTemplate                                      = require('../../enums/SmsTemplate');
import IndustryCodes                                    = require('../../enums/IndustryCodes');
import Utils                                            = require('../../common/Utils');
import Formatter                                        = require('../../common/Formatter');
import VerificationCodeCache                            = require('../../caches/VerificationCodeCache');

import Middleware                                       = require('./Middleware');
import Urls                                             = require('./Urls');

class DashboardRoute
{
    static PAGE_LOGIN:string = 'dashboard/login';
    static PAGE_INTEGRATIONS:string = 'dashboard/integrations';
    static PAGE_USERS:string = 'dashboard/integrationUsers';
    static PAGE_COUPONS:string = 'dashboard/integrationCoupons';
    static PAGE_PROFILE:string = 'dashboard/memberProfile';
    static PAGE_EDUCATION:string = 'dashboard/memberEducation';
    static PAGE_SKILL:string = 'dashboard/memberSkill';
    static PAGE_EMPOLYMENT:string = 'dashboard/memberEmployment';

    integrationDelegate = new IntegrationDelegate();
    integrationMemberDelegate = new IntegrationMemberDelegate();
    userDelegate = new UserDelegate();
    verificationCodeCache = new VerificationCodeCache();
    couponDelegate = new CouponDelegate();
    userEmploymentDelegate = new UserEmploymentDelegate();
    userSkillDelegate = new UserSkillDelegate();
    userEducationDelegate = new UserEducationDelegate();
    refSkillCodeDelegate = new RefSkillCodeDelegate();

    constructor(app)
    {
        // Pages
        app.get(Urls.index(), connect_ensure_login.ensureLoggedIn(), this.authSuccess.bind(this));
        app.get(Urls.login(), this.login.bind(this));
        app.get(Urls.integrations(), connect_ensure_login.ensureLoggedIn(), this.integrations.bind(this));
        app.get(Urls.integrationCoupons(), connect_ensure_login.ensureLoggedIn(), this.coupons.bind(this));
        app.get(Urls.integrationMembers(), Middleware.allowOwnerOrAdmin, this.integrationUsers.bind(this));
        app.get(Urls.memberProfile(), Middleware.allowSelf, this.memberProfile.bind(this));
        app.get(Urls.memberEducation(), Middleware.allowSelf, this.memberEducation.bind(this));
        app.get(Urls.memberEmployment(), Middleware.allowSelf, this.memberEmployment.bind(this));
        app.get(Urls.logout(), this.logout.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));

        app.post(Urls.memberProfile(), Middleware.allowSelf, this.memberProfileSave.bind(this));
    }

    login(req:express.Request, res:express.Response)
    {
        res.render(DashboardRoute.PAGE_LOGIN, {logged_in_user: req['user'], messages: req.flash()});
    }

    authSuccess(req:express.Request, res:express.Response)
    {
        var user = req['user'];

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

        this.integrationMemberDelegate.searchByUser(user.id, this.integrationMemberDelegate.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
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
                    selectedTab : 'integrations'
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

        this.couponDelegate.search({integration_id: integrationId}, null, this.couponDelegate.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_EXPERT])
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
                this.integrationMemberDelegate.search(search, null, this.integrationMemberDelegate.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]),
                this.verificationCodeCache.getInvitationCodes(integrationId)
            ])
            .then(
            function membersFetched(...results)
            {
                var members = results[0][0];
                var invitedMembers = [].concat(results[0][1]);

                members = members.concat(_.map(invitedMembers, function(invited) { return new IntegrationMember(invited); } ));
                _.each(members, function (member:IntegrationMember) {
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
        var self = this;
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);
        var user:any = req[ApiConstants.USER];
        self.refSkillCodeDelegate.getSkillName(user.id)
            .then(
                function(skills)
                {
                    self.integrationMemberDelegate.get(memberId)
                        .then(
                        function memberFetched(member)
                        {
                            var pageData =
                            {
                                'logged_in_user': req['user'],
                                'member'        : member,
                                'user'          : user,
                                'userSkill'     : skills,
                                'industryCodes' : Utils.enumToNormalText(IndustryCodes)
                            };
                            res.render(DashboardRoute.PAGE_PROFILE, pageData);
                        },
                        function userSkillFetchError(error) { res.send(500); }
                    )
                });
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

    memberEducation(req:express.Request, res:express.Response)
    {
        var self = this;
        var loggedInUser = req['user'];
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);
        self.userEducationDelegate.search({'user_id':loggedInUser.id})
            .then(
                function userEducationFetched(userEducation)
                {
                    var pageData =
                    {
                        'logged_in_user': req['user'],
                        'userEducation' : userEducation,
                        'memberId'      : memberId
                    };
                    res.render(DashboardRoute.PAGE_EDUCATION, pageData);
                },
                function userEducationFetchError() { res.send(500); }
            )
    }

    memberEmployment(req:express.Request, res:express.Response)
    {
        var self = this;
        var loggedInUser = req['user'];
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);
        self.userEmploymentDelegate.search({'user_id':loggedInUser.id})
            .then(
            function userEmploymentFetched(userEmployment)
            {
                var pageData =
                {
                    'logged_in_user'     : req['user'],
                    'userEmployment'     : userEmployment,
                    'memberId'           : memberId
                };
                res.render(DashboardRoute.PAGE_EMPOLYMENT, pageData);
            },
            function userEducationFetchError() { res.send(500); }
        )
    }

    logout(req, res)
    {
        req.logout();
        res.redirect(Urls.index());
    }
}

export = DashboardRoute