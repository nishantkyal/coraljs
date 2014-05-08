///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import log4js                                               = require('log4js');
import _                                                    = require('underscore');
import connect_ensure_login                                 = require('connect-ensure-login');
import IntegrationMember                                    = require('../models/IntegrationMember');
import User                                                 = require('../models/User');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import PhoneCallDelegate                                    = require('../delegates/PhoneCallDelegate');
import UserPhoneDelegate                                    = require('../delegates/UserPhoneDelegate');
import TransactionDelegate                                  = require('../delegates/TransactionDelegate');
import TransactionLineDelegate                              = require('../delegates/TransactionLineDelegate');
import UserProfileDelegate                                  = require('../delegates/UserProfileDelegate');
import UserSkillDelegate                                    = require('../delegates/UserSkillDelegate');
import UserEmploymentDelegate                               = require('../delegates/UserEmploymentDelegate');
import UserEducationDelegate                                = require('../delegates/UserEducationDelegate');
import IntegrationMemberRole                                = require('../enums/IntegrationMemberRole');
import ApiConstants                                         = require('../enums/ApiConstants');
import IncludeFlag                                          = require('../enums/IncludeFlag');
import Utils                                                = require('../common/Utils');
import Config                                               = require('../common/Config');

/*
 * Middleware to access control Integration REST APIs
 */
class AccessControl
{
    private static logger:log4js.Logger = log4js.getLogger(Utils.getClassName('AccessControl'));
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private transactionDelegate = new TransactionDelegate();
    private transactionLineDelegate = new TransactionLineDelegate();
    private userProfileDelegate = new UserProfileDelegate();
    private userSkillDelegate = new UserSkillDelegate();
    private userEmploymentDelegate = new UserEmploymentDelegate();
    private userEducationDelegate = new UserEducationDelegate();

    static allowOwner(req, res, next:Function)
    {
        var accessToken = req.query[ApiConstants.TOKEN];
        var integrationMemberId = req.params[ApiConstants.MEMBER_ID];

        AccessControl.getMember(accessToken, integrationMemberId)
            .then(
            function handleMemberFetched(integrationMember)
            {
                if (!Utils.isNullOrEmpty(integrationMember))
                    next();
                else
                    res.send(401);
            },
            function roleFetchError(error)
            {
                AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                res.send(500);
            }
        )
    }

    static allowAdmin(req, res, next)
    {
        var accessToken = req.query[ApiConstants.TOKEN];
        var integrationMemberId = req.params[ApiConstants.MEMBER_ID] || req.params[ApiConstants.EXPERT_ID];

        AccessControl.getMember(accessToken, integrationMemberId)
            .then(
            function handleMemberFetched(integrationMember)
            {
                if (!Utils.isNullOrEmpty(integrationMember))
                    next();
                else
                    res.send(401);
            },
            function roleFetchError(error)
            {
                AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                res.send(500);
            }
        )
    }

    static allowExpert(req, res, next)
    {
        var accessToken = req.query[ApiConstants.TOKEN];
        var integrationMemberId = req.params[ApiConstants.EXPERT_ID];

        AccessControl.getMember(accessToken, integrationMemberId)
            .then(
            function handleMemberFetched(integrationMember)
            {
                if (!Utils.isNullOrEmpty(integrationMember))
                    next();
                else
                    res.send(401);
            },
            function roleFetchError(error)
            {
                AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                res.send(500);
            }
        )
    }

    /* Helper method to get details of integration corresponding to token and member id */
    private static getMember(accessToken:string, integrationMemberId?:string, role?:IntegrationMemberRole):q.Promise<any>
    {
        return new IntegrationMemberDelegate().findValidAccessToken(accessToken, integrationMemberId, role);
    }

    /*
        Detect member from what is included in the url
        e.g. from find member for phone call
    */
    private detectMember(req:express.Request):q.Promise<IntegrationMember>
    {
        var self = this;

        for (var key in req.params)
        {
            switch(key)
            {
                case ApiConstants.MEMBER_ID:
                    var memberId:number = parseInt(req.param[key]);
                    return self.integrationMemberDelegate.get(memberId);

                case ApiConstants.PHONE_CALL_ID:
                    var callId:number = parseInt(req.param[key]);
                    return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);

                case ApiConstants.USER_PROFILE_ID:
                    var profileId:number = parseInt(req.param[key]);
                    return self.userProfileDelegate.get(profileId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);

                case ApiConstants.SKILL_ID:
                    var skillId:number = parseInt(req.param[key]);
                    return self.userSkillDelegate.get(skillId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);

                case ApiConstants.EMPLOYMENT_ID:
                    var employmentId:number = parseInt(req.param[key]);
                    return self.userEmploymentDelegate.get(employmentId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);

                case ApiConstants.EDUCATION_ID:
                    var educationId:number = parseInt(req.param[key]);
                    return self.userEducationDelegate.get(educationId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);
            }
        }

        return null;
    }

    /*
        Detect user from what is included in the url
        e.g. from find user for transaction
    */
    private detectUser(req:express.Request):q.Promise<User>
    {
        var self = this;

        for (var key in req.params)
        {
            switch(key)
            {
                case ApiConstants.USER_ID:
                    var memberId:number = parseInt(req.param[key]);
                    return self.integrationMemberDelegate.get(memberId);

                case ApiConstants.PHONE_NUMBER_ID:
                    var callId:number = parseInt(req.param[key]);
                    return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);

                case ApiConstants.TRANSACTION_ID:
                    var profileId:number = parseInt(req.param[key]);
                    return self.userProfileDelegate.get(profileId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);

                case ApiConstants.TRANSACTION_LINE_ID:
                    var skillId:number = parseInt(req.param[key]);
                    return self.userSkillDelegate.get(skillId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER]);

            }
        }

        return null;
    }

}
export = AccessControl