import q                                                    = require('q');
import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserSkillDelegate                                    = require('../delegates/UserSkillDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import UserSkill                                            = require('../models/UserSkill');
import User                                                 = require('../models/User');

class UserSkillApi
{
    userSkillDelegate;

    constructor(app, secureApp)
    {
        var self = this;
        this.userSkillDelegate = new UserSkillDelegate();

        app.put(ApiUrlDelegate.userSkill(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var loggedInUser = new User(req['user']);
            var skill = req.body[ApiConstants.USER_SKILL];
            var userId = loggedInUser.getId();

            self.userSkillDelegate.createSkill(skill, userId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            )
        });

        app.delete(ApiUrlDelegate.userSkillById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var loggedInUser = new User(req['user']);
            var skillId:number = parseInt(req.params[ApiConstants.SKILL_ID]);
            var userId = loggedInUser.getId();

            self.userSkillDelegate.delete({id:skillId})// if hard deleting then add userId:userId
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }

}
export = UserSkillApi