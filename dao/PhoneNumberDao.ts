///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/PhoneNumber.ts'/>

module dao
{
    export class PhoneNumberDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.PhoneNumber; }
    }
}