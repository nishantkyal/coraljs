import BaseDAO          = require('./BaseDAO');

class ServiceRequestDao extends BaseDAO
{

    static getTableName():string { return 'service_request'; }
    static getGeneratedIdName():string { return 'request_id'; }

}
export = ServiceRequestDao