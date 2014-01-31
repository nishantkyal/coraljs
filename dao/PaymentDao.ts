///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/Payment.ts'/>

module dao
{
    export class PaymentDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.Payment; }
    }
}