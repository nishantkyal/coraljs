import BaseDAO          = require('./BaseDAO');
import BaseModel        = require('../models/BaseModel');
import ExpertSchedule   = require('../models/ExpertSchedule');

class ExpertScheduleDao extends BaseDAO
{
    getModel():typeof BaseModel { return ExpertSchedule; }
}
export = ExpertScheduleDao