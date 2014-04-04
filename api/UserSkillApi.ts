import q                                                    = require('q');
import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserSkillDelegate                                    = require('../delegates/UserSkillDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import UserSkill                                            = require('../models/UserSkill');


class UserSkillApi
{
    userSkillDelegate;
    skillCodeDelegate;
    constructor(app)
    {
        var self = this;
        this.userSkillDelegate = new UserSkillDelegate();


        app.post(ApiUrlDelegate.userSkillById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var skill:any = req.body[ApiConstants.USER_SKILL];
            var skillId = parseInt(req.params[ApiConstants.SKILL_ID]);
            var newUserSkill:UserSkill = new UserSkill();
            newUserSkill.setId(skillId);
            self.userSkillDelegate.updateUserSkill(newUserSkill,skill.skill_name,skill.skill_lkin_code)
                .then(
                function userSkillUpdated() { res.send(200); },
                function userSkillUpdateError(error) { res.send(500); }
            )
        });

        app.put(ApiUrlDelegate.userSkill(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var loggedInUser = req['user'];
            var skill = req.body[ApiConstants.USER_SKILL];
            var newUserSkill:UserSkill = new UserSkill();
            newUserSkill.setUserId(loggedInUser.id);

            self.userSkillDelegate.createUserSkill(newUserSkill,skill.skill_name, skill.skill_lkin_code)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            )
        });

        app.delete(ApiUrlDelegate.userSkillById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var skillId = parseInt(req.params[ApiConstants.SKILL_ID]);
            self.userSkillDelegate.delete(skillId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }

}
export = UserSkillApi