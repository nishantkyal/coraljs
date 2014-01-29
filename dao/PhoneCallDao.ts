///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/PhoneCall.ts'/>

/**
 DAO for phone calls
 **/
module dao
{
    export class PhoneCallDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.PhoneCall; }
    }
}