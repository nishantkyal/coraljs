import q                        = require('q');
import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import UserSkill                = require('../models/UserSkill');
import MysqlDelegate            = require('../delegates/MysqlDelegate');

class UserSkillDao extends BaseDao
{
    getModel():typeof BaseModel { return UserSkill; }
    getSkillName(userId:number,transaction?:any):q.Promise<any>
    {
        var query = 'SELECT user_skill.id, skill_codes.skill as skill_name FROM user_skill INNER join skill_codes ' +
            'ON user_skill.skill_id = skill_codes.id AND user_skill.user_id = '+ userId;
        return MysqlDelegate.executeQuery(query, null,transaction);
    }
}
export = UserSkillDao