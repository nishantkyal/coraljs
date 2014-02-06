import BaseDao                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import TransactionLine          = require('../models/TransactionLine');

class TransactionLineDao extends BaseDao
{
    getModel():typeof BaseModel { return TransactionLine; }
}
export = TransactionLineDao