import q                        = require('q');
import BaseDAO                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleRule       = require('../models/ExpertScheduleRule');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import Utils                    = require('../common/Utils');

class ExpertScheduleDao extends BaseDAO
{
    getModel():typeof BaseModel { return ExpertScheduleRule; }

    findConflictingScheduleRules(startTime:number, endTime:number, integrationMemberId:number = 0):q.Promise<any>
    {
        var query = 'SELECT * ' +
            'FROM expert_schedule_rule ' +
            'WHERE start_time BETWEEN ' + startTime + ' AND ' + endTime + ' OR ' +
            'OR start_time BETWEEN (' + startTime + ' +  duration AND ' + (endTime + ' + duration)');

        if (!Utils.isNullOrEmpty(integrationMemberId))
            query += ' AND integration_member_id = ' + integrationMemberId;

        return MysqlDelegate.executeQuery(query);
    }
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
export = ExpertScheduleDao