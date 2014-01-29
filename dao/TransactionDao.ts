///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/Transaction.ts'/>

module dao
{
    export class TransactionDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.Transaction; }
    }
}