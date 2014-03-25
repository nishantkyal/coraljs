import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import TransactionLine          = require('../models/TransactionLine');

class TransactionLineDao extends BaseDao
{
    constructor() { super(TransactionLine); }
}
export = TransactionLineDao