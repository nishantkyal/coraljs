///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/Transaction.ts'/>

module dao
{
    export class TransactionDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.Transaction; }
    }
}