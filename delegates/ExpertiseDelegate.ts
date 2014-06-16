import q                                                        = require('q');
import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import PricingSchemeDelegate                                    = require('../delegates/PricingSchemeDelegate');
import Expertise                                                = require('../models/Expertise');
import PricingScheme                                            = require('../models/PricingScheme');
import IncludeFlag                                              = require('../enums/IncludeFlag');

class ExpertiseDelegate extends BaseDaoDelegate
{
    private pricingSchemeDelegate = new PricingSchemeDelegate();

    constructor() { super(Expertise); }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var self = this;

        switch(include)
        {
            case IncludeFlag.INCLUDE_PRICING_SCHEMES:
                return self.pricingSchemeDelegate.get(result.getPricingSchemeId());
        }
        return super.getIncludeHandler(include, result);
    }
}
export = ExpertiseDelegate