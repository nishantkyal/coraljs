///<reference path='../../_references.d.ts'/>
import q                                                            = require('q');
import _                                                            = require('underscore');
import express                                                      = require('express');
import connect_ensure_login                                         = require('connect-ensure-login');
import IntegrationMemberRole                                        = require('../../enums/IntegrationMemberRole');
import ApiConstants                                                 = require('../../enums/ApiConstants');
import Utils                                                        = require('../../common/Utils');
import Urls                                                         = require('./Urls');
import SessionData                                                  = require('./SessionData');
import IntegrationMemberDelegate                                    = require('../../delegates/IntegrationMemberDelegate');

class Middleware
{
    static allowOnlyMe =
        [
            connect_ensure_login.ensureLoggedIn(),
            function (req:express.Request, res:express.Response, next:Function)
            {
                var sessionData = new SessionData(req);
                var userId:number = parseInt(req.params[ApiConstants.USER_ID]);
                var loggedInUser = sessionData.getLoggedInUser();
                if (userId == loggedInUser.getId())
                    next();
                else
                    res.send(401);
            }];
}
export = Middleware