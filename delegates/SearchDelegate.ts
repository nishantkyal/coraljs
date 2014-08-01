import _                                                = require('underscore');
import User                                             = require('../models/User');
import PricingScheme                                    = require('../models/PricingScheme');
import ApiConstants                                     = require('../enums/ApiConstants');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import Utils                                            = require('../common/Utils');

class SearchDelegate
{
    applySearchParameters(searchParameters:Object, experts:User[]):User[]
    {
        var keys = _.keys(searchParameters);
        var invalidIndex = [];
        _.each(experts, function(expert:User,index){
            _.each(keys, function(key){
                switch(key)
                {
                    case ApiConstants.PRICE_RANGE:
                        if (!Utils.isNullOrEmpty(expert.getPricingScheme()))
                        {
                            var pricing:PricingScheme = expert.getPricingScheme()[0];
                            var perMinChargeInRupees = pricing.getChargingRate();

                            if (pricing.getPulseRate() > 1)
                                perMinChargeInRupees = perMinChargeInRupees / pricing.getPulseRate();
                            if (pricing.getUnit() == MoneyUnit.DOLLAR)
                                perMinChargeInRupees *= 60;

                            if (perMinChargeInRupees < searchParameters[key][0] || perMinChargeInRupees > searchParameters[key][1])
                                invalidIndex.push(index);
                        }
                        if (Utils.isNullOrEmpty(expert.getPricingScheme()) && searchParameters[key][0] > 0) //don't display experts with no pricing scheme when search price range > 0
                            invalidIndex.push(index);
                        break;

                    case ApiConstants.EXPERIENCE_RANGE:
                        break;

                    case ApiConstants.AVAILIBILITY:
                        if (!expert.isCurrentlyAvailable())
                            invalidIndex.push(index);
                        break;

                    case ApiConstants.USER_SKILL:
                        var expertSkills = _.map(expert.getSkill(), function(skill:any){
                            return skill.skill.skill;
                        });

                        var isValid = false;
                        _.each(searchParameters[key], function(skill){
                            if(_.indexOf(expertSkills,skill) != -1)
                                isValid = true;
                        })

                        if (!isValid)
                            invalidIndex.push(index);
                        break;
                }
            });
        });
        _.each(_.uniq(invalidIndex), function(index){
            delete experts[index];
        })
        return _.compact(experts);
    }
}
export = SearchDelegate