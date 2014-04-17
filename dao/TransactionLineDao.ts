import AbstractDao                  = require('./AbstractDao');
import BaseModel                = require('../models/BaseModel');
import TransactionLine          = require('../models/TransactionLine');

class TransactionLineDao extends AbstractDao
{
    constructor() { super(TransactionLine); }
}
export = TransactionLineDao