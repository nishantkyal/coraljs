///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/ExpertSchedule.ts'/>

module dao
{
    export class ScheduleDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.ExpertSchedule; }
    }
}