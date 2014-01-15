import BaseDAO              = require('./BaseDAO');
import BaseModel            = require('../models/BaseModel');
import ExpertSchedule       = require('../models/ExpertSchedule');

class ScheduleDao extends BaseDAO
{
    getModel():typeof BaseModel { return ExpertSchedule; }
}
export = ScheduleDao