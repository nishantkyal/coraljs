import q                                            = require('q');
import BaseDaoDelegate                              = require('./BaseDaoDelegate');
import IDao                                         = require('../dao/IDao');
import SkillCodeDao                                 = require('../dao/SkillCodeDao');

class SkillCodeDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new SkillCodeDao(); }
}
export = SkillCodeDelegate