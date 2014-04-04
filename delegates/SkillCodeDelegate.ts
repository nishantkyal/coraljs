import q                                            = require('q');
import BaseDaoDelegate                              = require('./BaseDaoDelegate');
import IDao                                         = require('../dao/IDao');
import SkillCodeDao                                 = require('../dao/SkillCodeDao');

class SkillCodeDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new SkillCodeDao(); }
    getSkillName(userId:any, transaction?:any):q.Promise<any>
    {
        return this.getDao().getSkillName(userId, transaction);
    }
}
export = SkillCodeDelegate