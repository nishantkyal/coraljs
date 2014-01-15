import BaseDAO          = require('./BaseDAO');
import BaseModel        = require('../models/BaseModel');
import Transaction      = require('../models/Transaction');

/**
 DAO for phone calls
 **/
class TransactionDao extends BaseDAO
{
    getModel():typeof BaseModel { return Transaction; }
}
export = TransactionDao