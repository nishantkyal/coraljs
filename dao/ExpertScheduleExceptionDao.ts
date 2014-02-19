import q                        = require('q');
import BaseDAO                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleException  = require('../models/ExpertScheduleException');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import Utils                    = require('../common/Utils');

class ExpertScheduleExceptionDao extends BaseDAO
{
    getModel():typeof BaseModel { return ExpertScheduleException; }

    findExceptionByRuleId(startTime:number, endTime:number, ruleId:number):q.Promise<any>
    {
        var query = 'SELECT * ' +
            'FROM expert_schedule_exceptions ' +
            'WHERE start_time BETWEEN ' + startTime + ' AND ' + endTime +
        ' AND schedule_rule_id = ' + ruleId;

        return MysqlDelegate.executeQuery(query);
    }
    findExceptionByExpertId(startTime:number, endTime:number, expertId:number):q.Promise<any>
    {
        var query = 'SELECT * ' +
            'FROM expert_schedule_exceptions ' +
            'WHERE start_time BETWEEN ' + startTime + ' AND ' + endTime +
            ' AND integration_member_id = ' + expertId;

        return MysqlDelegate.executeQuery(query);
    }
}
export = ExpertScheduleExceptionDao