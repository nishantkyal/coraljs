import AbstractDao                                          = require('../dao/AbstractDao');
import PricingScheme                                        = require('../models/PricingScheme');

class PricingSchemeDao extends AbstractDao
{
    constructor() { super(PricingScheme); }
}
export = PricingSchemeDao