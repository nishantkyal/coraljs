import BaseDAO          = require('./BaseDAO');

/**
 DAO for phone calls
 **/
class PhoneCallDao extends BaseDAO
{

    static getClassName():string { return 'call'; }
    static getGeneratedIdName():string { return 'call_id'; }

}
export = PhoneCallDao