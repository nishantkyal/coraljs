///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import _                                                    = require('underscore');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import SkillCodeDelegate                                    = require('./SkillCodeDelegate');
import UserSkill                                            = require('../models/UserSkill');
import SkillCode                                            = require('../models/SkillCode');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import Utils                                                = require('../common/Utils');
import IncludeFlag                                          = require('../enums/IncludeFlag');

class UserSkillDelegate extends BaseDaoDelegate
{
    constructor() { super(UserSkill); }

    private skillCodeDelegate = new SkillCodeDelegate();

    createSkill(skills, userId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return q.allSettled(_.map(skills, function(skill:any){
            var skillCode = new SkillCode();
            skillCode.setSkill(skill.skill_name);
            return self.createUserSkill(skillCode,userId,transaction);
        }))
    }

    createUserSkill(skillCode:SkillCode,userId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var userSkill:UserSkill = new UserSkill();
        userSkill.setUserId(userId);

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return self.skillCodeDelegate.create(skillCode,transaction)
            .then(
            function (skillCode)
            {
                userSkill.setSkillId(skillCode.getId());
                return self.create(userSkill, transaction);
            })
            .fail(
            function codeExists(){
                return self.skillCodeDelegate.find(Utils.createSimpleObject(SkillCode.COL_SKILL, skillCode.getSkill()))
                    .then(
                    function skillFound(refSkill){
                        userSkill.setSkillId(refSkill.getId());
                        return self.create(userSkill, transaction);
                    }
                )
            })
    }

    createSkillCode(skillName:string, linkedInSkillCode:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        var skillCode = new SkillCode();
        skillCode.setSkill(skillName);

        return self.skillCodeDelegate.create(skillCode,transaction);
    }
}
export = UserSkillDelegate