import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import ExpertSchedule           = require('../models/ExpertSchedule');

class ScheduleDao extends BaseDao
{
    constructor() { super(ExpertSchedule); }
}
export = ScheduleDao