import q                        = require('q');
import BaseDAO                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleException  = require('../models/ExpertScheduleException');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import Utils                    = require('../common/Utils');

class ExpertScheduleExceptionDao extends BaseDAO
{
    getModel():typeof BaseModel { return ExpertScheduleException; }

    getExceptionByIntegrationMemberId(expertId:number, startTime:number,  endTime:number):q.Promise<any>
    {
        var searchQuery = {
            'start_time' :{
                'operator': 'between',
                'value': [startTime, endTime]
            },
            'integration_member_id': expertId
        };
        return this.search(searchQuery);
    }

}
export = ExpertScheduleExceptionDao