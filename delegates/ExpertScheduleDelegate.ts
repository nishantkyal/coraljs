import _                                = require('underscore');
import q                                = require('q');
import BaseDAODelegate                  = require('./BaseDaoDelegate');
import IntegrationMemberDelegate        = require('./IntegrationMemberDelegate');
import MysqlDelegate                    = require('./MysqlDelegate');
import ExpertScheduleDAO                = require('../dao/ExpertScheduleDao');
import Schedule                         = require('../models/ExpertSchedule');
import ExpertScheduleDetails            = require('../models/ExpertScheduleRule');
import IntegrationMember                = require('../models/IntegrationMember');
import IDao                             = require('../dao/IDao');

/**
 * Delegate class for expert schedules
 */
class ExpertScheduleDelegate extends BaseDAODelegate
{
    getDao():IDao { return new ExpertScheduleDAO(); }

    /* Get schedules for expert */
    getSchedulesForExpert(integrationMemberId:string):q.makePromise
    {
        var that = this;
        return new IntegrationMemberDelegate().get(integrationMemberId, ['id'])
            .then(
            function integrationMemberIdResolved(integrationMember)
            {
                return that.getDao().search({'integration_member_id': integrationMember.id})
            });
    }

    /* Create new schedule */
    create(object:Object, transaction?:any):q.makePromise
    {
        var _super = super;

        // Don't create if schedule with same details already exists
        return super.search(object)
            .then(
                function handleScheduleSearched(schedules:Array)
                {
                    if (schedules.length != 0)
                        return _super.create(object, transaction);
                    else
                        throw('Schedule already exists with the same details');
                }
            )
    }

}
export = ExpertScheduleDelegate