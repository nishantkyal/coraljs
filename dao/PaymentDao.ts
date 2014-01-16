import BaseDAO                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import Payment                  = require('../models/Payment');

class PaymentDao extends BaseDAO
{
    getModel():typeof BaseModel { return Payment; }
}
export = PaymentDao