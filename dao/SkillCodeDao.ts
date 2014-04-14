import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import SkillCode                = require('../models/SkillCode');

class SkillCodeDao extends BaseDao
{
    constructor() { super(SkillCode); }
}
export = SkillCodeDao


