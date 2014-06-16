import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import PricingSchemeDao                                         = require('../dao/PricingSchemeDao');

class PricingSchemeDelegate extends BaseDaoDelegate
{
    constructor() { super(new PricingSchemeDao()); }
}
export = PricingSchemeDelegate