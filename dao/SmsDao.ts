///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/SMS.ts'/>

module dao
{
    export class SmsDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.SMS; }
    }
}