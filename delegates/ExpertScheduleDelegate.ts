import q                        = require('q');
import BaseDAODelegate          = require('./BaseDaoDelegate');
import MysqlDelegate            = require('./MysqlDelegate');
import ExpertScheduleDAO        = require('../dao/ExpertScheduleDao');
import Schedule                 = require('../models/Schedule');
import IDao                     = require('../dao/IDao');

/**
 * Delegate class for expert schedules
 */
class ExpertScheduleDelegate extends BaseDAODelegate
{

    getDao():IDao { return new ExpertScheduleDAO(); }

    searchSchedule(keywords:string[], startTime:number, endTime:number):q.makePromise
    {
        var query = 'SELECT im.integration_member_id expert_id, im.first_name ' +
            'FROM integration_member im, integration_member_schedule s, integration_member_keywords k ' +
            'WHERE ';
        return MysqlDelegate.executeQuery(query);
    }

}
export = ExpertScheduleDelegate