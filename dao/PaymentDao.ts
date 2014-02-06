import BaseDao                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import Payment                  = require('../models/Payment');

class PaymentDao extends BaseDao
{
    getModel():typeof BaseModel { return Payment; }
}
export = PaymentDao