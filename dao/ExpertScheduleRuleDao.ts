///<reference path='../_references.d.ts'/>
import _                        = require('underscore');
import BaseDao                  = require('./BaseDao');
import q                        = require('q');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleRule       = require('../models/ExpertScheduleRule');
import MysqlDelegate            = require('../delegates/MysqlDelegate');


class ExpertScheduleRuleDao extends BaseDao
{
    getModel():typeof BaseModel { return ExpertScheduleRule; }

    getRuleById(integrationMemberId:number, startTime:number, endTime:number, transaction?:any):q.Promise<any>
    {
        var query = 'SELECT * ' +
            'FROM ' + this.getModel().TABLE_NAME +
            ' WHERE integration_member_id = ? AND id NOT IN ' +
            '   (SELECT id ' +
            '   FROM ' + this.getModel().TABLE_NAME +
            '   WHERE integration_member_id = ? ' +
            '       AND (repeat_end <= ? OR repeat_start >= ?))';


        return MysqlDelegate.executeQuery(query, [integrationMemberId, integrationMemberId, startTime, endTime], transaction)
            .then(
            function rulesFetched(rules:any)
            {
                return _.map(rules, function (rule)
                {
                    return new ExpertScheduleRule(rule);
                });
            });
    }

}
export = ExpertScheduleRuleDao