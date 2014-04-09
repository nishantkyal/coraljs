///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import log4js                                               = require('log4js');
import connect_ensure_login                                 = require('connect-ensure-login');
import IntegrationMember                                    = require('../models/IntegrationMember');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import IntegrationMemberRole                                = require('../enums/IntegrationMemberRole');
import ApiConstants                                         = require('../enums/ApiConstants');
import Utils                                                = require('../common/Utils');
import Config                                               = require('../common/Config');

/*
 * Middleware to access control Integration REST APIs
 */
class AccessControl
{
    private static logger:log4js.Logger = log4js.getLogger(Utils.getClassName('AccessControl'));

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
                    res.status(401).json('Unauthorized');
            },
            function roleFetchError(error)
            {
                AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                res.status(500).json("Couldn't authenticate request");
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
                    res.status(401).json('Unauthorized');
            },
            function roleFetchError(error)
            {
                AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                res.status(500).json("Couldn't authenticate request");
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
                    res.status(401).json('Unauthorized');
            },
            function roleFetchError(error)
            {
                AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                res.status(500).json("Couldn't authenticate request");
            }
        )
    }

    static allowDashboard = [
        connect_ensure_login.ensureLoggedIn()
    ];

    /* Helper method to get details of integration corresponding to token and member id */
    private static getMember(accessToken:string, integrationMemberId?:string, role?:IntegrationMemberRole):q.Promise<any>
    {
        var search = {'access_token': accessToken};
        if (integrationMemberId)
            search[IntegrationMember.ID] = integrationMemberId;
        if (role)
            search[IntegrationMember.ROLE] = role;

        return new IntegrationMemberDelegate().find(search);
    }

}
export = AccessControl