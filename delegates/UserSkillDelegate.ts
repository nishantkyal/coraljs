///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserSkillDao                                         = require('../dao/UserSkillDao');

class UserSkillDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new UserSkillDao(); }
}
export = UserSkillDelegate