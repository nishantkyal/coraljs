import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import Payment                                                  = require('../models/Payment');

class PaymentDelegate extends BaseDaoDelegate
{
    constructor() { super(Payment); }
}
export = PaymentDelegate