import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserEmploymentDelegate                               = require('../delegates/UserEmploymentDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');

class UserEmploymentApi
{
    private userEmploymentDelegate;
    constructor(app)
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
                function userUpdateError() { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.userEmployment(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var loggedInUser = req['user'];
            var employment = req.body[ApiConstants.USER_EMPLOYMENT];
            employment.user_id = loggedInUser.id;
            self.userEmploymentDelegate.create(employment)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError() { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.userEmploymentById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var employmentId = parseInt(req.params[ApiConstants.EMPLOYMENT_ID]);
            self.userEmploymentDelegate.delete(employmentId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError() { res.send(500); }
            );
        });
    }
}
export = UserEmploymentApi