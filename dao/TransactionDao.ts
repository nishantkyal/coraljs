import BaseDAO          = require('./BaseDAO');

/**
 DAO for phone calls
 **/
class TransactionDao extends BaseDAO
{
    static getClassName():string { return 'transaction'; }
    static getGeneratedIdName():string { return 'transaction_id'; }

}
export = TransactionDao