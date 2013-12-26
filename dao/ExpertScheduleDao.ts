import BaseDAO          = require('./BaseDAO');

class ExpertScheduleDao extends BaseDAO
{

    static getTableName():string { return 'expert_schedule'; }
    static getGeneratedIdName():string { return 'schedule_id'; }

}
export = ExpertScheduleDao