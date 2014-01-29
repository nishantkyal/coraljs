///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/Email.ts'/>

/**
 * DAO class for Email queue
 */
module dao
{
    export class EmailDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.Email; }
    }
}