import q                                                        = require('q');
import _                                                        = require('underscore');
import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                            = require('../delegates/MysqlDelegate');
import UserSkillDelegate                                        = require('../delegates/UserSkillDelegate');
import SkillCodeDelegate                                        = require('../delegates/SkillCodeDelegate');
import MapExpertiseSkillDelegate                                = require('../delegates/MapExpertiseSkillDelegate');
import ExpertiseSkillDelegate                                   = require('../delegates/ExpertiseSkillDelegate');
import Expertise                                                = require('../models/Expertise');
import UserSkill                                                = require('../models/UserSkill');
import SkillCode                                                = require('../models/SkillCode');
import MapExpertiseSkill                                        = require('../models/MapExpertiseSkill');
import IncludeFlag                                              = require('../enums/IncludeFlag');
import Utils                                                    = require('../common/Utils');

class ExpertiseDelegate extends BaseDaoDelegate
{
    constructor() { super(Expertise); }
    expertiseSkillDelegate = new ExpertiseSkillDelegate();
    mapExpertiseSkillDelegate = new MapExpertiseSkillDelegate();
    skillCodeDelegate = new SkillCodeDelegate();

    createExpertiseSkill(skills, expertiseId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return q.allSettled(_.map(skills, function(skill:any){
            return self.createExpertiseSkillMap(skill.skill_name,expertiseId,transaction);
        }))
    }

    createExpertiseSkillMap(skillName:string,expertiseId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var skill:MapExpertiseSkill = new MapExpertiseSkill();
        skill.setExpertiseId(expertiseId);

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        var skillCode = new SkillCode();
        skillCode.setSkill(skillName);

        return self.skillCodeDelegate.create(skillCode,transaction)
            .then(
            function (skillCode)
            {
                skill.setSkillId(skillCode.getId());
                return self.mapExpertiseSkillDelegate.create(skill,transaction);
            })
            .fail(
            function ()
            {
                return self.skillCodeDelegate.find({'skill':skillCode.getSkill()})
                    .then(
                    function skillFound(refSkill)
                    {
                        skill.setSkillId(refSkill.getId());
                        return self.mapExpertiseSkillDelegate.create(skill,transaction);
                    }
                )
            })
    }
}
export = ExpertiseDelegate