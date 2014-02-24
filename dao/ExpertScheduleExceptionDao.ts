import q                        = require('q');
import BaseDAO                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleException  = require('../models/ExpertScheduleException');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import Utils                    = require('../common/Utils');

class ExpertScheduleExceptionDao extends BaseDAO
{
    getModel():typeof BaseModel { return ExpertScheduleException; }

    findExceptionByRuleId(scheduleId:number):q.Promise<any>
    {
        /*var search = {
            'start_time' :{
                'operator': 'between',
                'value': [startTime, endTime]
            },
            'schedule_rule_id': ruleId
        };*/
        var search = {
            'schedule_rule_id': scheduleId
        }

        return this.search(search);
    }
    findExceptionByExpertId(expertId:number):q.Promise<any>
    {
        var search = {
            'integration_member_id': expertId
        };

        return this.search(search);
    }
}
export = ExpertScheduleExceptionDao