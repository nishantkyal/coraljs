import AbstractDao                                      = require('./AbstractDao');
import BaseModel                                        = require('../models/BaseModel');
import Payment                                          = require('../models/Payment');

class PaymentDao extends AbstractDao
{
    constructor() { super(Payment); }
}
export = PaymentDao