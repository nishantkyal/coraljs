///<reference path='../../_references.d.ts'/>
import _                                                            = require('underscore');
import express                                                      = require('express');
import connect_ensure_login                                         = require('connect-ensure-login');
import IntegrationMemberRole                                        = require('../../enums/IntegrationMemberRole');
import ApiConstants                                                 = require('../../enums/ApiConstants');
import Utils                                                        = require('../../common/Utils');
import Urls                                                         = require('./Urls');
import SessionData                                                  = require('./SessionData');

class Middleware
{
    static allowOwnerOrAdmin =
        [
            connect_ensure_login.ensureLoggedIn(),
            function (req, res:express.Response, next:Function)
            {
                var sessionData = new SessionData(req);

                var integrationMembers = sessionData.getMembers();
                var integrationId:number = parseInt(req.params[ApiConstants.INTEGRATION_ID]);

                var isAdmin = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Admin}));
                var isOwner = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Owner}));

                if (isAdmin || isOwner)
                    next();
                else
                    res.send(401);
            }];

    static allowExpert =
        [
            connect_ensure_login.ensureLoggedIn(),
            function (req:express.Request, res:express.Response, next:Function)
            {
                var sessionData = new SessionData(req);
                var integrationMembers = sessionData.getMembers();
                var expertId:number = parseInt(req.params[ApiConstants.EXPERT_ID]);

                var isValidExpert = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'id': expertId, 'role': IntegrationMemberRole.Expert}));

                if (isValidExpert)
                    next();
                else
                    res.send(401);
            }];

    static allowOnlyMe =
        [
            connect_ensure_login.ensureLoggedIn(),
            function (req:express.Request, res:express.Response, next:Function)
            {
                var sessionData = new SessionData(req);
                var integrationMembers = sessionData.getMembers();
                var memberId:number = parseInt(req.params[ApiConstants.MEMBER_ID]);
                var loggedInUser = sessionData.getLoggedInUser();

                var isSelf = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'id': memberId, 'user_id': loggedInUser.getId()}));

                if (isSelf)
                    next();
                else
                    res.send(401);
            }];

    static allowMeOrAdmin=
        [
            connect_ensure_login.ensureLoggedIn(),
            function (req:express.Request, res:express.Response, next:Function)
            {
                var sessionData = new SessionData(req);
                var integrationMembers = sessionData.getMembers();
                var memberId:number = parseInt(req.params[ApiConstants.MEMBER_ID]);
                var loggedInUser = sessionData.getLoggedInUser();
                var integrationId:number = sessionData.getIntegration().getId();

                var isSelf = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'id': memberId, 'user_id': loggedInUser.getId()}));
                var isAdmin = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Admin}));
                var isOwner = !Utils.isNullOrEmpty(_.findWhere(integrationMembers, {'integration_id': integrationId, 'role': IntegrationMemberRole.Owner}));

                if (isSelf || isAdmin || isOwner)
                    next();
                else
                    res.send(401);
            }];
}
export = Middleware