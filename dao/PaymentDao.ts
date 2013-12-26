import BaseDAO                  = require('./BaseDAO');

class PaymentDao extends BaseDAO {

    static getTableName():string
    {
        return 'payment';
    }

    static getGeneratedIdName():string
    {
        return 'payment_id';
    }
}
export = PaymentDao