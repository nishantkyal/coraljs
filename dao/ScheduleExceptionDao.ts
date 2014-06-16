import q                                                    = require('q');
import AbstractDao                                          = require('./AbstractDao');
import BaseModel                                            = require('../models/BaseModel');
import ScheduleException                              = require('../models/ScheduleException');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import Utils                                                = require('../common/Utils');

class ScheduleExceptionDao extends AbstractDao
{
    constructor() { super(ScheduleException); }

    getExceptionByIntegrationMemberId(expertId:number, startTime:number,  endTime:number):q.Promise<any>
    {
        var self = this;
        var searchQuery = {
            'start_time' :{
                'operator': 'between',
                'value': [startTime, endTime]
            },
            'integration_member_id': expertId
        };
        return self.search(searchQuery);
    }

}
export = ScheduleExceptionDao