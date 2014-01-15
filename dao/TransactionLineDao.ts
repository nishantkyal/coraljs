import BaseDAO          = require('./BaseDAO');
import BaseModel        = require('../models/BaseModel');
import TransactionLine      = require('../models/TransactionLine');

/**
 DAO for phone calls
 **/
class TransactionLineDao extends BaseDAO
{
    getModel():typeof BaseModel { return TransactionLine; }
}
export = TransactionLineDao