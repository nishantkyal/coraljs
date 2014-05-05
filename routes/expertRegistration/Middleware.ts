///<reference path='../../_references.d.ts'/>
import express                                          = require('express');
import SessionData                                      = require('./SessionData');
import Urls                                             = require('./Urls');
import Utils                                            = require('../../common/Utils');

class Middleware
{
    static requireInvitationCode(req:express.Request, res:express.Response, next:Function)
    {
        var sessionData = new SessionData(req);

        if (!Utils.isNullOrEmpty(sessionData.getInvitationCode())
            && !Utils.isNullOrEmpty(sessionData.getIntegrationId()))
            next();
        else if (!Utils.isNullOrEmpty(sessionData.getInvitationCode()))
            res.send(401, "Invalid invitation code. Please click on the link in the invitation email.");
    }
}
export = Middleware