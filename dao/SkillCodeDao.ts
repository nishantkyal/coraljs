import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import SkillCodeModel           = require('../models/SkillCode');

class SkillCodeDao extends BaseDao
{
    getModel():typeof BaseModel { return SkillCodeModel; }
}
export = SkillCodeDao


