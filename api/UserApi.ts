import q                                    = require('q');
import fs                                   = require('fs');
import express                              = require('express');
import _                                    = require('underscore');
import ApiConstants                         = require('../enums/ApiConstants');
import AuthenticationDelegate               = require('../delegates/AuthenticationDelegate');
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
import ImageSize                            = require('../enums/ImageSize');
import Utils                                = require('../common/Utils');
import Config                               = require('../common/Config');

/*
 Rest Calls for User
 Allow only searchntalk.com
 */
class UserApi
{
    constructor(app, secureApp)
    {
        var userDelegate = new UserDelegate();
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
        app.post(ApiUrlDelegate.userById(), AuthenticationDelegate.checkLogin(), function (req, res:express.Response)
        {
            var userId:string = req.params[ApiConstants.USER_ID];
            var user:User = req.body[ApiConstants.USER];
            var userProfile:UserProfile = req.body[ApiConstants.USER_PROFILE];

            var password:string = req.body[ApiConstants.PASSWORD];
            var oldPassword:string = req.body[ApiConstants.OLD_PASSWORD];

            //if password exists then we are not updating any other fields
            if (!Utils.isNullOrEmpty(password) && !Utils.isNullOrEmpty(oldPassword))
            {
                var hashedPassword:string = user.getPasswordHash(user.getEmail(), oldPassword, user.getPasswordSeed());
                if (hashedPassword != user.getPassword())
                    res.send('Error in changing password. Old Password did not match').status(412);
                else
                    userDelegate.update({id: userId}, {password: password})
                        .then(
                        function passwordUpdated() { res.send('Password Changed Successfully').status(200); },
                        function PasswordUpdateError(error) { res.send('Password Change Failed. Internal Server Error').status(500); }
                    )
            }
            else
            {
                userDelegate.update({'id': userId}, user)
                    .then(
                    function userUpdated(result):any
                    {
                        if (userProfile)
                            return userProfileDelegate.update({'user_id': userId, 'locale': userProfile.getLocale()}, userProfile);
                        else
                            return res.json(result);
                    })
                    .then(
                    function userProfileUpdated(result)
                    {
                        return userDelegate.get(userId);
                    })
                    .then(
                    function userFetched(user)
                    {
                        req.logIn(user, function loggedInUserUpdated() {
                            res.send(user);
                        });
                    },
                    function updateFailed(err)
                    {
                        res.json(500, err);
                    });
            }
        });

        /* Profile image */
        app.post(ApiUrlDelegate.userProfilePicture(), AuthenticationDelegate.checkLogin(), express.bodyParser({uploadDir: Config.get(Config.PROFILE_IMAGE_PATH)}), function (req:express.Request, res:express.Response)
        {
            var uploadedFile = req.files['image'];
            var userId = parseInt(req.params[ApiConstants.USER_ID]);

            userDelegate.processProfileImage(userId, uploadedFile.path)
                .then(
                function uploadComplete()
                {
                    res.json({url: ApiUrlDelegate.userProfilePicture(userId)});
                },
                function uploadError(error) { res.send('Error in uploading image').status(500); }
            );
        });

        app.get(ApiUrlDelegate.userProfilePicture(), function (req:express.Request, res)
        {
            var userId = req.params[ApiConstants.USER_ID];
            var size:ImageSize = parseInt(req.query[ApiConstants.IMAGE_SIZE]) || ImageSize.MEDIUM;
            var imagePath = Config.get(Config.PROFILE_IMAGE_PATH) + userId + '_' + ImageSize[size].toLowerCase();

            if (fs.existsSync(imagePath))
                res.sendfile(imagePath);
            else
                res.sendfile('public/images/1x1.png');
        });

    }
}
export = UserApi