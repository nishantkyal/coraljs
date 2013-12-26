import BaseDAO              = require('./BaseDAO');

class ScheduleDao extends BaseDAO
{
    static getTableName():string { return 'expert_schedule'; }
    static getGeneratedIdName():string { return 'schedule_id'; }
}
export = ScheduleDao