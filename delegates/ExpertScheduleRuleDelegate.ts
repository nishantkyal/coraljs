import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import IDao                         = require('../dao/IDao');
import ExpertScheduleRuleDao        = require('../dao/ExpertScheduleRuleDao');
import ExpertScheduleRule           = require('../models/ExpertScheduleRule');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');

class ExpertScheduleRuleDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new ExpertScheduleRuleDao(); }

    /*create(scheduleRule:any, transaction?:any):q.makePromise
    {
        var s = super;

        var expertScheduleRuleDao:any = this.getDao();

        return expertScheduleRuleDao.findConflictingScheduleRules(scheduleRule.getRepeatStart(), scheduleRule.getRepeatEnd(), scheduleRule.getIntegrationMemberId())
            .then(
            function schedulesSearched(schedules:Array)
            {
                if (schedules.length != 0)
                    return s.create(scheduleRule, transaction);
                else
                    throw {
                        'message': 'Conflicting schedule rules found',
                        'conflicts': schedules
                    };
            });
    }*/

    getRulesByIntegrationMemberId(integrationMemberId:number):q.makePromise
    {
        return this.getDao().search({'integration_member_id': integrationMemberId});
    }

}
export = ExpertScheduleRuleDelegate