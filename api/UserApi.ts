///<reference path='../_references.d.ts'/>
import q                                    = require('q');
import fs                                   = require('fs');
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
import Config                               = require('../common/Config');
import VerificationCodeCache                = require('../caches/VerificationCodeCache');

/*
 Rest Calls for User
 Allow only searchntalk.com
 */
class UserApi
{
    constructor(app, secureApp)
    {
        var userDelegate = new UserDelegate();
        var userOauthDelegate = new UserOAuthDelegate();
        var userProfileDelegate = new UserProfileDelegate();

        /* Create user */
        app.put(ApiUrlDelegate.user(), AccessControl.allowOwner, function (req:express.Request, res:express.Response)
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

        /* Profile image */
        app.post(ApiUrlDelegate.userProfilePicture(), AccessControl.allowDashboard, express.bodyParser({uploadDir: Config.get(Config.PROFILE_IMAGE_PATH)}), function(req:express.Request, res:express.Response)
        {
            var uploadedFile = req.files['image'];
            var userId = parseInt(req.params[ApiConstants.USER_ID]);

            userDelegate.processProfileImage(userId, uploadedFile.path)
                .then(
                    function uploadComplete() {
                        res.json({url: ApiUrlDelegate.userProfilePicture(userId)});
                    },
                    function uploadError(error) { res.send(500); }
                );
        });

        app.get(ApiUrlDelegate.userProfilePicture(), function(req:express.Request, res)
        {
            var userId = req.params[ApiConstants.USER_ID];
            if (fs.existsSync(Config.get(Config.PROFILE_IMAGE_PATH) + userId))
                res.sendfile(userId, {root: Config.get(Config.PROFILE_IMAGE_PATH)});
            else
                res.redirect('/img/no_photo-icon.gif');
        });

    }
}
export = UserApi