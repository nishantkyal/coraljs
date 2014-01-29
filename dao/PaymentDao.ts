///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/Payment.ts'/>

module dao
{
    export class PaymentDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.Payment; }
    }
}