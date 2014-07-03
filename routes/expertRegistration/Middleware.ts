import express                                                          = require('express');
import IntegrationMemberDelegate                                        = require('../../delegates/IntegrationMemberDelegate');
import IntegrationMember                                                = require('../../models/IntegrationMember');
import SessionData                                                      = require('./SessionData');
import Urls                                                             = require('./Urls');
import Utils                                                            = require('../../common/Utils');
import Config                                                           = require('../../common/Config');

class Middleware
{
    static requireInvitationCode(req:express.Request, res:express.Response, next:Function)
    {
        var sessionData = new SessionData(req);

        var isInvitationCodeValid:boolean = !Utils.isNullOrEmpty(sessionData.getInvitationCode());
        var isIntegrationIdValid:boolean = !Utils.isNullOrEmpty(sessionData.getIntegrationId());
        var isDefaultIntegrationId:boolean = sessionData.getIntegrationId() == Config.get(Config.DEFAULT_NETWORK_ID);

        if (isIntegrationIdValid && (isInvitationCodeValid || isDefaultIntegrationId))
            next();
        else if (!Utils.isNullOrEmpty(sessionData.getInvitationCode()))
            res.send(401, "Invalid invitation code. Please click on the link in the invitation email.");
    }

    static ensureNotAlreadyRegistered(req:express.Request, res:express.Response, next:Function)
    {
        var sessionData = new SessionData(req);
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        integrationMemberDelegate.find({'user_id': sessionData.getLoggedInUser().getId(), 'integration_id': sessionData.getIntegrationId()})
            .then(
            function memberFetched(member:IntegrationMember)
            {
                if (member)
                    res.redirect(Urls.authorizationRedirect());
                else
                    next();
            },
            function memberFetchFailed(error)
            {
                next();
            });

    }
}
export = Middleware