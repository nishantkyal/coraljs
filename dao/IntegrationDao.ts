///<reference path='../_references.d.ts'/>
///<reference path='./BaseDao.ts'/>
///<reference path='../delegates/MysqlDelegate.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/Integration.ts'/>

/**
 * DAO class for third party integrations
 */
module dao
{
    export class IntegrationDao extends BaseDao
    {
        static getAll():Q.Promise<any>
        {
            return delegates.MysqlDelegate.executeQuery('SELECT * FROM integration', null);
        }

        static getModel():typeof models.BaseModel { return models.Integration; }
    }
}