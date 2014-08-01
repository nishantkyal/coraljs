import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserEducationDelegate                                = require('../delegates/UserEducationDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import UserEducation                                        = require('../models/UserEducation');

class UserEducationApi
{
    userEducationDelegate;
    constructor(app)
    {
        var self = this;
        this.userEducationDelegate = new UserEducationDelegate();

        app.post(ApiUrlDelegate.userEducationById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var education:any = req.body[ApiConstants.USER_EDUCATION];
            var educationId = parseInt(req.params[ApiConstants.EDUCATION_ID]);
            self.userEducationDelegate.update({id: educationId}, education)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.userEducation(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var loggedInUser = req['user'];
            var education:UserEducation = req.body[ApiConstants.USER_EDUCATION];

            self.userEducationDelegate.create(education)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.userEducationById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var educationId = parseInt(req.params[ApiConstants.EDUCATION_ID]);
            var profileId:number = parseInt(req.body[ApiConstants.USER_PROFILE_ID]);

            self.userEducationDelegate.delete({id:educationId}) // if hard deleting then add profileId:profileId
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }
}
export = UserEducationApi