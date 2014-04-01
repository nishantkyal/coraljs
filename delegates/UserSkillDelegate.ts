///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserSkillDao                                         = require('../dao/UserSkillDao');
import UserSkill                                            = require('../models/UserSkill');

class UserSkillDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS:string[] = [UserSkill.ID, UserSkill.USER_ID,UserSkill.SKILL];
    getDao():IDao { return new UserSkillDao(); }
}
export = UserSkillDelegate