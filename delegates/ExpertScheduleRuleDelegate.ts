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

    getRulesByIntegrationMemberId(integrationMemberId:number):q.makePromise
    {
        return this.getDao().search({'integration_member_id': integrationMemberId})
            .then(
            function handleRulesSearched(rules:Array)
            {
                return _.map(rules, function (rule)
                {
                    return new ExpertScheduleRule(rule);
                });
            });
    }

}
export = ExpertScheduleRuleDelegate