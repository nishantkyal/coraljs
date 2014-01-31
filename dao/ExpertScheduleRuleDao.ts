///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/ExpertScheduleRule.ts'/>

module dao
{
    export class ExpertScheduleRuleDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.ExpertScheduleRule; }
    }
}