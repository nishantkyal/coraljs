import q                                = require('q');
import express                          = require('express');
import log4js                           = require('log4js');
import Config                           = require('../Config');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import IntegrationMemberRole            = require('../enums/IntegrationMemberRole');
import Utils                            = require('../Utils');

/**
 * Middleware to access control Integration REST APIs
 * Note: Website accesses delegates directly and doesn't go through the APIs hence no access control middleware for it
 */
class AccessControl {

    private static logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    /** For forum plugins **/
    static allowOwner(req, res, next:Function)
    {
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['memberId'];
        AccessControl.getIntegration(accessToken, integrationMemberId)
            .then(
            function handleRoleFetched(integrationMember)
            {
                if (integrationMember.integration_id === Config.get(Config.DASHBOARD_INTEGRATION_ID) || integrationMember.role === IntegrationMemberRole.OWNER)
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

    /** For forum plugins **/
    static allowAdmin(req, res, next)
    {
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['memberId'];
        AccessControl.getIntegration(accessToken, integrationMemberId)
            .then(
            function handleRoleFetched(integrationMember)
            {
                if (integrationMember.integration_id === Config.get(Config.DASHBOARD_INTEGRATION_ID) || integrationMember.role >= IntegrationMemberRole.ADMIN)
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

    /** For forum plugins **/
    static allowExpert(req, res, next)
    {
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['expertId'];
        AccessControl.getIntegration(accessToken, integrationMemberId)
            .then(
            function handleRoleFetched(integrationMember)
            {
                if (integrationMember.integration_id === Config.get(Config.DASHBOARD_INTEGRATION_ID) || integrationMember.role === IntegrationMemberRole.EXPERT)
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

    /** For searchntalk.com **/
    static allowDashboard(req, res, next)
    {
        var accessToken = req.query['token'];
        AccessControl.getIntegration(accessToken)
            .then(
            function handleRoleFetched(integrationMember)
            {
                if (integrationMember && integrationMember.integration_id === Config.get(Config.DASHBOARD_INTEGRATION_ID))
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

    /** Helper method to get details of integration corresponding to token and member id**/
    static getIntegration(accessToken:string, integrationMemberId?:string):q.makePromise
    {
        var search = {'access_token': accessToken};
        if (integrationMemberId)
            search['integration_member_id'] = integrationMemberId;

        return new IntegrationMemberDelegate().findValidAccessToken(accessToken, integrationMemberId);
    }

}
export = AccessControl