import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import Transaction              = require('../models/Transaction');

class TransactionDao extends BaseDao
{
    getModel():typeof BaseModel { return Transaction; }
}
export = TransactionDao