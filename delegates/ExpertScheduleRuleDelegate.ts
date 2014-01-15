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

    getRulesByExpert(expertId:string):q.makePromise
    {
        var that = this;
        return new IntegrationMemberDelegate().get(expertId, ['id'])
            .then(
            function integrationMemberIdResolved(integrationMember)
            {
                return that.getDao().search({'integration_member_id': integrationMember.id})
            })
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