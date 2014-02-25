import BaseDao                  = require('./BaseDao');
import q                        = require('q');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleRule       = require('../models/ExpertScheduleRule');
import MysqlDelegate            = require('../delegates/MysqlDelegate');


class ExpertScheduleRuleDao extends BaseDao
{
    getModel():typeof BaseModel { return ExpertScheduleRule; }

    getRuleById(integrationMemberId:number, startTime:number,  endTime:number):q.Promise<any>
    {
        var search = {
                     'repeat_start' :{
                         'operator': 'between',
                         'value': [startTime, endTime]
                     },
                    'repeat_end' :{
                        'operator': 'between',
                        'value': [startTime, endTime]
                    },
                    'integration_member_id': integrationMemberId
            };
        return this.search(search);
    }
}
export = ExpertScheduleRuleDao