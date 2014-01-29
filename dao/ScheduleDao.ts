///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/ExpertSchedule.ts'/>

module dao
{
    export class ScheduleDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.ExpertSchedule; }
    }
}