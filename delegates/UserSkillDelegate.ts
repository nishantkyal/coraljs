///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import SkillCodeDelegate                                    = require('./SkillCodeDelegate');
import MapProfileSkillDao                                   = require('../dao/MapProfileSkillDao');
import UserSkillDao                                         = require('../dao/UserSkillDao');
import UserSkill                                            = require('../models/UserSkill');
import SkillCode                                            = require('../models/SkillCode');
import MapProfileSkill                                      = require('../models/MapProfileSkill');

class UserSkillDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserSkillDao()); }

    private skillCodeDelegate = new SkillCodeDelegate();

    createUserSkillWithMap(userSkill:UserSkill, profileId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var mapProfileSkillDao = new MapProfileSkillDao();
        return self.create(userSkill,transaction)
            .then(function userSkillCreated(emp:UserSkill){
                var mapProfileSkill:MapProfileSkill = new MapProfileSkill();
                mapProfileSkill.setSkillId(emp.getId());
                mapProfileSkill.setProfileId(profileId);
                return mapProfileSkillDao.create(mapProfileSkill,transaction);
            })
    }

    createUserSkill(userSkill:UserSkill, skillName:string, linkedInSkillCode:number, profileId:number, transaction?:any):q.Promise<any>
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
                return self.createUserSkillWithMap(userSkill, profileId, transaction)
            },
            function skillCodeError(error) //code exists
            {
                return self.skillCodeDelegate.find({'linkedin_code':skillCode.getLinkedinCode()})
                    .then(
                        function skillFound(refSkill){
                            userSkill.setSkillId(refSkill.getId());
                            return self.createUserSkillWithMap(userSkill, profileId, transaction);
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
                return self.skillCodeDelegate.find({'linkedin_code':skillCode.getLinkedinCode()})
                    .then(
                    function skillFound(refSkill){
                        userSkill.setSkillId(refSkill.getId());
                        return self.update({id: userSkill.getId()}, userSkill, transaction);
                    }
                )
            }
        )
    }

    getSkillWithName(profileId:any, transaction?:any):q.Promise<any>
    {
        var skillDao:any = this.dao;
        return skillDao.getSkillWithName(profileId, transaction);
    }
}
export = UserSkillDelegate