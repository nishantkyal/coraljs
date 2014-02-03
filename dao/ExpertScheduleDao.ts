///<reference path='../_references.d.ts'/>
///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/ExpertSchedule.ts'/>
///<reference path='../delegates/MysqlDelegate.ts'/>
///<reference path='../common/Utils.ts'/>

module dao
{
    export class ExpertScheduleDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.ExpertSchedule; }

        findConflictingScheduleRules(startTime:number, endTime:number, integrationMemberId?:number):Q.Promise<any>
        {
            var query = 'SELECT * ' +
                'FROM expert_schedule_rule ' +
                'WHERE start_time BETWEEN ' + startTime + ' AND ' + endTime + ' OR ' +
                'OR start_time BETWEEN (' + startTime + ' +  duration AND ' + (endTime + ' + duration)');

            if (!common.Utils.isNullOrEmpty(integrationMemberId))
                query += ' AND integration_member_id = ' + integrationMemberId;

            return delegates.MysqlDelegate.executeQuery(query);
        }
    }
}