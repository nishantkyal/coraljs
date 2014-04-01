import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserEducationDelegate                                = require('../delegates/UserEducationDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');

class UserEducationApi
{
    userEducationDelegate;
    constructor(app)
    {
        var self = this;
        this.userEducationDelegate = new UserEducationDelegate();

        app.post(ApiUrlDelegate.userEducationById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var education:any = req.body[ApiConstants.USER_EDUCATION];
            var educationId = parseInt(req.params[ApiConstants.EDUCATION_ID]);
            self.userEducationDelegate.update({id: educationId}, education)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError() { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.userEducation(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var loggedInUser = req['user'];
            var education = req.body[ApiConstants.USER_EDUCATION];
            education.user_id = loggedInUser.id;
            self.userEducationDelegate.create(education)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError() { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.userEducationById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var educationId = parseInt(req.params[ApiConstants.EDUCATION_ID]);
            self.userEducationDelegate.delete(educationId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError() { res.send(500); }
            );
        });
    }
}
export = UserEducationApi