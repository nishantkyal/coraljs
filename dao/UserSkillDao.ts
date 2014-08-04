import BaseMappingDao                                       = require('../dao/BaseMappingDao');
import UserSkill                                            = require('../models/UserSkill');

class UserSkillDao extends BaseMappingDao
{
    constructor() { super(UserSkill); }
}
export = UserSkillDao