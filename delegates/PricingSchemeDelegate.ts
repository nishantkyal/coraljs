import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import PricingScheme                                            = require('../models/PricingScheme');

class PricingSchemeDelegate extends BaseDaoDelegate
{
    constructor() { super(PricingScheme); }
}
export = PricingSchemeDelegate