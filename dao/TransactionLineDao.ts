///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/TransactionLine.ts'/>

module dao
{
    export class TransactionLineDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.TransactionLine; }
    }
}