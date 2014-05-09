import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import PaymentDao                                               = require('../dao/PaymentDao');

class PaymentDelegate extends BaseDaoDelegate
{
    constructor() { super(new PaymentDao()); }
}
export = PaymentDelegate