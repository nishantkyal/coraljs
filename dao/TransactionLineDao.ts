///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/TransactionLine.ts'/>

module dao
{
    export class TransactionLineDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.TransactionLine; }
    }
}