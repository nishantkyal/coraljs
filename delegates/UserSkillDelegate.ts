///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import SkillCodeDelegate                                    = require('./SkillCodeDelegate');
import IDao                                                 = require('../dao/IDao');
import UserSkillDao                                         = require('../dao/UserSkillDao');
import UserSkill                                            = require('../models/UserSkill');
import SkillCode                                            = require('../models/SkillCode');

class UserSkillDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS:string[] = [UserSkill.ID, UserSkill.USER_ID,UserSkill.SKILL_ID];
    private skillCodeDelegate = new SkillCodeDelegate();

    getDao():IDao { return new UserSkillDao(); }

    createUserSkill(userSkill:UserSkill, skillName:string, linkedInSkillCode:number, transaction?:any):q.Promise<any>
    {
        var self = this;

        var skillCode = new SkillCode();
        skillCode.setLinkedinCode(linkedInSkillCode);
        skillCode.setSkill(skillName);

        return self.skillCodeDelegate.create(skillCode)
            .then(
            function skillCodeCreated(createdSkillCode)
            {
                userSkill.setSkillId(createdSkillCode.getId());
                return self.create(userSkill, transaction)
            },
            function skillCodeError(error) //code exists
            {
                return self.skillCodeDelegate.find({'lkin_code':skillCode.getLinkedinCode()})
                    .then(
                        function skillFound(refSkill){
                            userSkill.setSkillId(refSkill.getId());
                            return self.create(userSkill, transaction);
                        }
                    )
            }
        );
    }

    updateUserSkill(userSkill:UserSkill, skillName:string, linkedInSkillCode:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var skillCode:SkillCode = new SkillCode();
        skillCode.setLinkedinCode(linkedInSkillCode);
        skillCode.setSkill(skillName);

        return self.skillCodeDelegate.create(skillCode)
            .then(
            function skillCodeCreated(skillCode){
                userSkill.setSkillId(skillCode.getId());
                return self.update({id: userSkill.getId()}, userSkill, transaction)
            },
            function skillCodeError(error) //code exists
            {
                return self.skillCodeDelegate.find({'lkin_code':skillCode.getLinkedinCode()})
                    .then(
                    function skillFound(refSkill){
                        userSkill.setSkillId(refSkill.getId());
                        return self.update({id: userSkill.getId()}, userSkill, transaction);
                    }
                )
            }
        )
    }

    getSkillName(userId:any, transaction?:any):q.Promise<any>
    {
        var skillDao:any = this.getDao();
        return skillDao.getSkillName(userId, transaction);
    }
}
export = UserSkillDelegate