///<reference path='./BaseDao.ts'/>

module dao
{
    export class ServiceRequestDao extends BaseDao
    {
        static getTableName():string { return 'service_request'; }
        static getGeneratedIdName():string { return 'request_id'; }
    }
}