import q                        = require('q');
import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import SkillCodeModel           = require('../models/SkillCode');
import MysqlDelegate            = require('../delegates/MysqlDelegate');

class SkillCodeDao extends BaseDao
{
    getModel():typeof BaseModel { return SkillCodeModel; }
    getSkillName(userId:number,transaction?:any):q.Promise<any>
    {
        var query = 'SELECT user_skill.id, skill_codes.skill as skill_name FROM user_skill INNER join skill_codes ' +
                    'ON user_skill.skill_id = skill_codes.id AND user_skill.user_id = '+ userId;
        return MysqlDelegate.executeQuery(query, null,transaction);
    }
}
export = SkillCodeDao


