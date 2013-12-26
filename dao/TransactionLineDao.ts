import BaseDAO             = require('../dao/BaseDAO');

class TransactionLineDao extends BaseDAO
{
    static getTableName():string { return 'transaction_line'; }
}
export = TransactionLineDao