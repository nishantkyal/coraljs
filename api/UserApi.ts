///<reference path='../_references.d.ts'/>
import q                                    = require('q');
import express                              = require('express');
import _                                    = require('underscore');
import ApiConstants                         = require('../enums/ApiConstants');
import ApiUrlDelegate                       = require('../delegates/ApiUrlDelegate');
import UserDelegate                         = require('../delegates/UserDelegate');
import UserProfileDelegate                  = require('../delegates/UserProfileDelegate');
import UserOAuthDelegate                    = require('../delegates/UserOAuthDelegate');
import TransactionDelegate                  = require('../delegates/TransactionDelegate');
import AccessControl                        = require('../middleware/AccessControl');
import RequestHandler                       = require('../middleware/RequestHandler');
import UserOauth                            = require('../models/UserOauth');
import User                                 = require('../models/User');
import UserProfile                          = require('../models/UserProfile');
import IntegrationMember                    = require('../models/IntegrationMember');
import Utils                                = require('../common/Utils');
import VerificationCodeCache                = require('../caches/VerificationCodeCache');

/*
 Rest Calls for User
 Allow only searchntalk.com
 */
class UserApi
{

    constructor(app)
    {
        var userDelegate = new UserDelegate();
        var userOauthDelegate = new UserOAuthDelegate();
        var userProfileDelegate = new UserProfileDelegate();

        /* Create user */
        app.put(ApiUrlDelegate.user(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var user:User = req.body[ApiConstants.USER];

            if (user.isValid())
                userDelegate.create(user)
                    .then(
                    function userCreated(user:User) { res.json(user); },
                    function userCreateError(err) { res.status(500).json(err); }
                );
            else
                res.status(500).json('Invalid data');
        });

        /* Update settings */
        app.post(ApiUrlDelegate.userById(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var userId:string = req.params[ApiConstants.USER_ID];
            var user:User = req.body[ApiConstants.USER];
            var userProfile:UserProfile = req.body[ApiConstants.USER_PROFILE];

            userDelegate.update({'id': userId}, user)
                .then(
                function userUpdated(result):any
                {
                    if (userProfile)
                        return userProfileDelegate.update({'user_id': userId, 'locale': userProfile.getLocale()}, userProfile)
                    else
                        return res.json(result);
                })
                .then(
                function userProfileUpdated(result) { res.send(result); },
                function updateFailed(err) { res.status(500).json(err); }
            );
        });


        /* Get account balance */
        app.get(ApiUrlDelegate.userTransactionBalance(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
        });

        /* Update OAuth token */
        app.put(ApiUrlDelegate.userOAuthToken(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var userOauth:UserOauth = req.body[ApiConstants.OAUTH];
            var user:User = req.body[ApiConstants.USER];

            if (userOauth.isValid())
                userOauthDelegate.addOrUpdateToken(userOauth, user)
                    .then(
                    function tokenAdded(updatedUser:User) { res.json(updatedUser); },
                    function tokenAddError(err) { res.status(500).json(err); }
                );
            else
                res.status(500).json('Invalid input');
        });

    }
}
export = UserApi