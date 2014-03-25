import BaseDao      = require('./BaseDao');
import BaseModel    = require('../models/BaseModel');
import UserSkill    = require('../models/UserSkill');

class UserSkillDao extends BaseDao
{
    getModel():typeof BaseModel { return UserSkill; }
}
export = UserSkillDao