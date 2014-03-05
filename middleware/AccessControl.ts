import q                                = require('q');
import express                          = require('express');
import log4js                           = require('log4js');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import IntegrationMemberRole            = require('../enums/IntegrationMemberRole');
import Utils                            = require('../common/Utils');
import Config                           = require('../common/Config');

/*
 * Middleware to access control Integration REST APIs
 * Note: Website accesses delegates directly and doesn't go through the APIs hence no access control middleware for it
 */
class AccessControl
{
    private static logger:log4js.Logger = log4js.getLogger(Utils.getClassName('AccessControl'));

    static allowOwner(req, res, next:Function)
    {
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['memberId'];
        AccessControl.getIntegration(accessToken, integrationMemberId)
            .then(
            function handleRoleFetched(integrationMember)
            {
                if (AccessControl.isRequestFromDashboard(req) || integrationMember.role === IntegrationMemberRole.Owner)
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
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['memberId'];
        AccessControl.getIntegration(accessToken, integrationMemberId)
            .then(
            function handleRoleFetched(integrationMember)
            {
                if (AccessControl.isRequestFromDashboard(req) || integrationMember.role >= IntegrationMemberRole.Admin)
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
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['expertId'];
        AccessControl.getIntegration(accessToken, integrationMemberId)
            .then(
            function handleRoleFetched(integrationMember)
            {
                if (AccessControl.isRequestFromDashboard(req) || integrationMember.role === IntegrationMemberRole.Expert)
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

    static allowDashboard(req, res, next)
    {
        if (AccessControl.isRequestFromDashboard(req))
            next();
        else
        {
            AccessControl.logger.error('Auth failed for IP: ' + req.ip);
            res.status(500).json("Couldn't authenticate request");
        }
    }

    private static isRequestFromDashboard(req)
    {
        var remoteAddress = req.ip;
        var searchntalkHosts = Config.get('SearchNTalk.hosts');

        if (!searchntalkHosts && searchntalkHosts.length == 0)
            this.logger.error('NO SEARCHNTALK HOSTS CONFIGURED, DASHBOARD WONT AUTHENTICATE');

        return searchntalkHosts.indexOf(remoteAddress) != -1;
    }

    /* Helper method to get details of integration corresponding to token and member id */
    static getIntegration(accessToken:string, integrationMemberId?:string):q.Promise<any>
    {
        var search = {'access_token': accessToken};
        if (integrationMemberId)
            search['integration_member_id'] = integrationMemberId;

        return new IntegrationMemberDelegate().findValidAccessToken(accessToken, integrationMemberId);
    }

}
export = AccessControl