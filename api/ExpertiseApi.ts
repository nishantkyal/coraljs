import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import ExpertiseDelegate                                    = require('../delegates/ExpertiseDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import Expertise                                            = require('../models/Expertise');

class ExpertiseApi
{
    private expertiseDelegate = new ExpertiseDelegate();

    constructor(app, secureApp)
    {
        var self = this;

        app.post(ApiUrlDelegate.expertiseById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var expertise:any = req.body[ApiConstants.USER_EXPERTISE];
            var expertiseId = parseInt(req.params[ApiConstants.EXPERTISE_ID]);
            self.expertiseDelegate.update({id: expertiseId}, expertise)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.expertise(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var loggedInUser = req[ApiConstants.USER];
            var expertise:Expertise = req.body[ApiConstants.USER_EXPERTISE];
            expertise.setUserId(loggedInUser.id);

            self.expertiseDelegate.create(expertise)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.expertiseById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var expertiseId = parseInt(req.params[ApiConstants.EXPERTISE_ID]);
            var profileId:number = parseInt(req.body[ApiConstants.USER_PROFILE_ID]);

            self.expertiseDelegate.delete({id:expertiseId}) // if hard deleting then add profileId:profileId
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }
}
export = ExpertiseApi