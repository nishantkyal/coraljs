import q                        = require('q');
import BaseDAO                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import ExpertSchedule           = require('../models/ExpertSchedule');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import Utils                    = require('../Utils');

class ExpertScheduleDao extends BaseDAO
{
    getModel():typeof BaseModel { return ExpertSchedule; }

    findConflictingScheduleRules(startTime:number, endTime:number, integrationMemberId?:number):q.makePromise
    {
        var query = 'SELECT * ' +
            'FROM expert_schedule_rule ' +
            'WHERE start_time BETWEEN ' + startTime + ' AND ' + endTime + ' OR ' +
            'OR start_time BETWEEN (' + startTime + ' +  duration AND ' + (endTime + ' + duration)');

        if (!Utils.isNullOrEmpty(integrationMemberId))
            query += ' AND integration_member_id = ' + integrationMemberId;

        return MysqlDelegate.executeQuery(query);
    }
}
export = ExpertScheduleDao