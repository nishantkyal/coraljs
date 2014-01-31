///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/SMS.ts'/>

module dao
{
    export class SmsDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.SMS; }
    }
}