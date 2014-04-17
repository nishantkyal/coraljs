import AbstractDao                  = require('./AbstractDao');
import BaseModel                = require('../models/BaseModel');
import ExpertSchedule           = require('../models/ExpertSchedule');

class ScheduleDao extends AbstractDao
{
    constructor() { super(ExpertSchedule); }
}
export = ScheduleDao