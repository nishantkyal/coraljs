import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserEmploymentDelegate                               = require('../delegates/UserEmploymentDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import UserEmployment                                       = require('../models/UserEmployment');

class UserEmploymentApi
{
    private userEmploymentDelegate;
    constructor(app, secureApp)
    {
        var self = this;
        this.userEmploymentDelegate = new UserEmploymentDelegate();

        app.post(ApiUrlDelegate.userEmploymentById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var employment:any = req.body[ApiConstants.USER_EMPLOYMENT];
            var employmentId = parseInt(req.params[ApiConstants.EMPLOYMENT_ID]);
            self.userEmploymentDelegate.update({id: employmentId}, employment)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.userEmployment(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var loggedInUser = req['user'];
            var employment:UserEmployment = new UserEmployment();
            employment = req.body[ApiConstants.USER_EMPLOYMENT];
            var profileId = req.body[ApiConstants.USER_PROFILE_ID];

            self.userEmploymentDelegate.createUserEmployment(employment,profileId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.userEmploymentById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var employmentId = parseInt(req.params[ApiConstants.EMPLOYMENT_ID]);
            var profileId:number = parseInt(req.body[ApiConstants.USER_PROFILE_ID]);

            self.userEmploymentDelegate.delete(employmentId) // if hard deleting then add profileId:profileId
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }
}
export = UserEmploymentApi