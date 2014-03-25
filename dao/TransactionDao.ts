import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import Transaction              = require('../models/Transaction');

class TransactionDao extends BaseDao
{
    constructor() { super(Transaction); }
}
export = TransactionDao