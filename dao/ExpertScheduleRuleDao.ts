import BaseDao                  = require('./BaseDao');
import q                        = require('q');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleRule       = require('../models/ExpertScheduleRule');
import MysqlDelegate            = require('../delegates/MysqlDelegate');


class ExpertScheduleRuleDao extends BaseDao
{
    getModel():typeof BaseModel { return ExpertScheduleRule; }
    findRuleByExpertId(startTime:number, endTime:number, integrationMemberId:number):q.Promise<any>
    {
        var query = 'SELECT * ' +
            'FROM expert_schedule_rules ' +
            'WHERE start_time BETWEEN ' + startTime + ' AND ' + endTime + ' OR ' +
            'OR start_time BETWEEN (' + startTime + ' +  duration AND ' + (endTime + ' + duration)');
        ' AND integration_member_id = ' + integrationMemberId;

        return MysqlDelegate.executeQuery(query);
    }
}
export = ExpertScheduleRuleDao