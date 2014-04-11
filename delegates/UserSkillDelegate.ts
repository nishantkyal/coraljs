///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import SkillCodeDelegate                                    = require('./SkillCodeDelegate');
import IDao                                                 = require('../dao/IDao');
import UserSkillDao                                         = require('../dao/UserSkillDao');
import UserSkill                                            = require('../models/UserSkill');
import SkillCodeModel                                       = require('../models/SkillCode');

class UserSkillDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS:string[] = [UserSkill.ID, UserSkill.USER_ID,UserSkill.SKILL_ID];

    getDao():IDao { return new UserSkillDao(); }

    createUserSkill(userSkill:UserSkill, skillName:string, lkin_code:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var skillCodeDelegate = new SkillCodeDelegate();
        var newRefSkill:SkillCodeModel = new SkillCodeModel();
        if(lkin_code)
            newRefSkill.setLkinCode(lkin_code);
        newRefSkill.setSkill(skillName);

        return skillCodeDelegate.create(newRefSkill)
            .then(
            function skillCodeCreated(refSkill){
                userSkill.setSkillId(refSkill.getId());
                return self.create(userSkill, transaction)
            },
            function skillCodeError(error) //code exists
            {
                return skillCodeDelegate.find({'lkin_code':newRefSkill.getLkinCode()})
                    .then(
                        function skillFound(refSkill){
                            userSkill.setSkillId(refSkill.getId());
                            return self.create(userSkill, transaction);
                        }
                    )
            }
        );
    }

    updateUserSkill(userSkill:UserSkill, skillName:string, lkin_code:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var skillCodeDelegate = new SkillCodeDelegate();
        var newRefSkill:SkillCodeModel = new SkillCodeModel();
        if(lkin_code)
            newRefSkill.setLkinCode(lkin_code);
        newRefSkill.setSkill(skillName);

        return skillCodeDelegate.create(newRefSkill)
            .then(
            function skillCodeCreated(refSkill){
                userSkill.setSkillId(refSkill.getId());
                return self.update({id: userSkill.getId()}, userSkill, transaction)
            },
            function skillCodeError(error) //code exists
            {
                return skillCodeDelegate.find({'lkin_code':newRefSkill.getLkinCode()})
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