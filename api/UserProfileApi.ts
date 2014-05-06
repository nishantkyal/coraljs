///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import passport                                             = require('passport');
import connect_ensure_login                                 = require('connect-ensure-login');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserProfileDelegate                                  = require('../delegates/UserProfileDelegate');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiConstants                                         = require('../enums/ApiConstants');
import IntegrationMember                                    = require('../models/IntegrationMember');
import UserProfile                                          = require('../models/UserProfile');

class UserProfileApi
{
    constructor(app, secureApp)
    {
        var userProfileDelegate = new UserProfileDelegate();
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        app.get(ApiUrlDelegate.userProfileById(), connect_ensure_login.ensureLoggedIn(), function(req:express.Request, res:express.Response)
        {
            var userProfileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);

            userProfileDelegate.get(userProfileId)
                .then(
                function profileFetched(profile) { res.json(profile); },
                function profileFetchError(error) { res.status(500).send(error); }
            );
        });

        app.get(ApiUrlDelegate.userProfile(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];

            userProfileDelegate.search(userProfile)
                .then(
                function profileFetched(profile) { res.json(profile); },
                function profileFetchError(error) { res.status(500).send(error); }
            );
        });

        app.post(ApiUrlDelegate.userProfileById(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];
            var userProfileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);

            userProfileDelegate.update({id: userProfileId}, userProfile)
                .then(
                function profileUpdated(profile) { res.json(profile); },
                function profileUpdateError(error) { res.status(500).send(error); }
            );
        });

        app.put(ApiUrlDelegate.userProfile(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];

            userProfileDelegate.create(userProfile)
                .then(
                function profileCreated(profile) { res.json(profile); },
                function profileCreateError(error) { res.status(500).send(error); }
            );
        });

        app.delete(ApiUrlDelegate.userProfileById(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfileId = req.params[ApiConstants.USER_PROFILE_ID];

            userProfileDelegate.delete(userProfileId)
                .then(
                function profileDeleted(profile) { res.json(profile); },
                function profileDeleteError(error) { res.status(500).send(error); }
            );
        });

    }

}
export = UserProfileApi