///<reference path='../../_references.d.ts'/>
import _                                                            = require('underscore');
import express                                                      = require('express');
import IntegrationMemberRole                                        = require('../../enums/IntegrationMemberRole');
import ApiConstants                                                 = require('../../enums/ApiConstants');
import Utils                                                        = require('../../common/Utils');

class Middleware
{
    private static SESSION_INTEGRATION_MEMBERS:string = 'integration_members';
    private static SESSION_INTEGRATION_ID:string = 'integration_id';

    static setIntegrationMembers(req, integrationMembers:any):void { req.session[Middleware.SESSION_INTEGRATION_MEMBERS] = integrationMembers; }
    static getIntegrationMembers(req):any { return req.session[Middleware.SESSION_INTEGRATION_MEMBERS]; }

    static setIntegrationId(req, integrationId:number):void { req.session[Middleware.SESSION_INTEGRATION_ID] = integrationId; }
    static getIntegrationId(req):any { return req.session[Middleware.SESSION_INTEGRATION_ID]; }

    static allowOwnerOrAdmin(req:express.Request, res:express.Response, next:Function)
    {
        var integrationMembers = Middleware.getIntegrationMembers(req);
        var integrationId:number = parseInt(req.params[ApiConstants.INTEGRATION_ID]);

        var isAdmin = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Admin}));
        var isOwner = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Owner}));

        if (isAdmin || isOwner)
            next();
        else
        // TODO: Change to error flash and then redirect
            res.redirect('/login');
    }

    static allowExpert(req:express.Request, res:express.Response, next:Function)
    {
        var integrationMembers = Middleware.getIntegrationMembers(req);
        var expertId:number = parseInt(req.params[ApiConstants.EXPERT_ID]);

        var isValidExpert = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'id': expertId, 'role': IntegrationMemberRole.Expert}));

        if (isValidExpert)
            next();
        else
            res.redirect('/login');
    }

    static allowSelf(req:express.Request, res:express.Response, next:Function)
    {
        var integrationMembers = Middleware.getIntegrationMembers(req);
        var memberId:number = parseInt(req.params[ApiConstants.MEMBER_ID]);

        var isSelf = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'id': memberId}));

        if (isSelf)
            next();
        else
            res.redirect('/login');
    }
}
export = Middleware