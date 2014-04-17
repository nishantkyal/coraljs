import AbstractDao                  = require('./AbstractDao');
import BaseModel                = require('../models/BaseModel');
import Transaction              = require('../models/Transaction');

class TransactionDao extends AbstractDao
{
    constructor() { super(Transaction); }
}
export = TransactionDao