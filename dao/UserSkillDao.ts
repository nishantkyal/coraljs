import q                                            = require('q');
import AbstractMappingDao                           = require('./AbstractMappingDao');
import BaseModel                                    = require('../models/BaseModel');
import UserSkill                                    = require('../models/UserSkill');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');

class UserSkillDao extends AbstractMappingDao
{
    constructor() { super(UserSkill); }

    getSkillWithName(profileId:number,transaction?:any):q.Promise<any>
    {
        var query = 'SELECT user_skill.id, skill_codes.skill as skill_name FROM user_skill INNER join skill_codes ' +
            'ON user_skill.skill_id = skill_codes.id AND user_skill.id'  +' IN (SELECT skill_id FROM map_profile_skill where profile_id = ' + profileId +')' +
            ' WHERE (user_skill.deleted IS NULL OR user_skill.deleted = 0)' ;
        return MysqlDelegate.executeQuery(query, null, transaction);
    }
}
export = UserSkillDao