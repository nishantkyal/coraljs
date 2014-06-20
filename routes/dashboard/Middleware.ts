import q                                                            = require('q');
import _                                                            = require('underscore');
import express                                                      = require('express');
import IntegrationMemberRole                                        = require('../../enums/IntegrationMemberRole');
import ApiConstants                                                 = require('../../enums/ApiConstants');
import Utils                                                        = require('../../common/Utils');
import Urls                                                         = require('./Urls');
import SessionData                                                  = require('./SessionData');
import AuthenticationDelegate                                       = require('../../delegates/AuthenticationDelegate');
import IntegrationMemberDelegate                                    = require('../../delegates/IntegrationMemberDelegate');

class Middleware
{
    static allowOnlyMe =
        [
            AuthenticationDelegate.checkLogin(),
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