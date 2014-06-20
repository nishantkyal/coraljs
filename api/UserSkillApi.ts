import q                                                    = require('q');
import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserSkillDelegate                                    = require('../delegates/UserSkillDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import UserSkill                                            = require('../models/UserSkill');

class UserSkillApi
{
    userSkillDelegate;

    constructor(app, secureApp)
    {
        var self = this;
        this.userSkillDelegate = new UserSkillDelegate();


        app.post(ApiUrlDelegate.userSkillById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var skill:any = req.body[ApiConstants.USER_SKILL];
            var skillId = parseInt(req.params[ApiConstants.SKILL_ID]);
            var newUserSkill:UserSkill = new UserSkill();
            newUserSkill.setId(skillId);
            self.userSkillDelegate.updateUserSkill(newUserSkill,skill.skill_name,skill.skill_linkedin_code)
                .then(
                function userSkillUpdated() { res.send(200); },
                function userSkillUpdateError(error) { res.send(500); }
            )
        });

        app.put(ApiUrlDelegate.userSkill(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var loggedInUser = req['user'];
            var skill = req.body[ApiConstants.USER_SKILL];
            var profileId = req.body[ApiConstants.USER_PROFILE_ID];
            var newUserSkill:UserSkill = new UserSkill();


            self.userSkillDelegate.createUserSkill(newUserSkill,skill.skill_name, skill.skill_linkedin_code, profileId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            )
        });

        app.delete(ApiUrlDelegate.userSkillById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var skillId:number = parseInt(req.params[ApiConstants.SKILL_ID]);
            var profileId:number = parseInt(req.body[ApiConstants.USER_PROFILE_ID]);

            self.userSkillDelegate.delete({id:skillId})// if hard deleting then add profileId:profileId
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }

}
export = UserSkillApi