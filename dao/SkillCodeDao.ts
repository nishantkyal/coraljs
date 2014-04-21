import AbstractDao                              = require('./AbstractDao');
import BaseModel                                = require('../models/BaseModel');
import SkillCode                                = require('../models/SkillCode');

class SkillCodeDao extends AbstractDao
{
    constructor() { super(SkillCode); }
}
export = SkillCodeDao


