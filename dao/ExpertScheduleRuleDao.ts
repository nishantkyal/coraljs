import BaseDao                  = require('./BaseDao');
import q                        = require('q');
import BaseModel                = require('../models/BaseModel');
import ExpertScheduleRule       = require('../models/ExpertScheduleRule');
import MysqlDelegate            = require('../delegates/MysqlDelegate');


class ExpertScheduleRuleDao extends BaseDao
{
    getModel():typeof BaseModel { return ExpertScheduleRule; }

    getRuleById(integrationMemberId:number, startTime:number,  endTime:number, transaction?:any):q.Promise<any>
    {
        var query = 'SELECT * FROM ' +  this.getModel().TABLE_NAME
            + ' WHERE integration_member_id = ' + integrationMemberId
            + ' AND deleted = 0'
            + ' AND ( repeat_start between ' + startTime +' AND ' + endTime
            + ' OR repeat_end between ' + startTime + ' AND ' + endTime + ' OR repeat_end = 0)';

        return MysqlDelegate.executeQuery(query, null, transaction);
    }
}
export = ExpertScheduleRuleDao