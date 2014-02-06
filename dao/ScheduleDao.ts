import BaseDao                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import ExpertSchedule           = require('../models/ExpertSchedule');

class ScheduleDao extends BaseDao
{
    getModel():typeof BaseModel { return ExpertSchedule; }
}
export = ScheduleDao