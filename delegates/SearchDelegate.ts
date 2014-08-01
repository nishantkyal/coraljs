import q                                                = require('q');
import _                                                = require('underscore');
import User                                             = require('../models/User');
import UserSkill                                        = require('../models/UserSkill');
import Schedule                                         = require('../models/Schedule');
import PricingScheme                                    = require('../models/PricingScheme');
import ApiConstants                                     = require('../enums/ApiConstants');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import Utils                                            = require('../common/Utils');
import ScheduleDelegate                                 = require('../delegates/ScheduleDelegate');

class SearchDelegate
{
    private scheduleDelegate = new ScheduleDelegate();

    applyFiltersToExperts(searchParameters:Object, experts:User[]):q.Promise<User[]>
    {
        var self = this;
        var keys = _.keys(searchParameters);

        return q.all(_.map(experts, function (expert:User)
        {
            return q.all(_.map(keys, function (key)
            {
                switch (key)
                {
                    case ApiConstants.PRICE_RANGE:
                        return expert.getPricingScheme()
                            .then(
                            function schemesFetched(schemes:PricingScheme[])
                            {
                                if (!Utils.isNullOrEmpty(schemes))
                                {
                                    var pricing:PricingScheme = schemes[0];
                                    var perMinChargeInRupees = pricing.getChargingRate();

                                    if (pricing.getPulseRate() > 1)
                                        perMinChargeInRupees = perMinChargeInRupees / pricing.getPulseRate();
                                    if (pricing.getUnit() == MoneyUnit.DOLLAR)
                                        perMinChargeInRupees *= 60;

                                    if (perMinChargeInRupees < searchParameters[key][0] || perMinChargeInRupees > searchParameters[key][1])
                                        return q.reject();
                                }

                                if (Utils.isNullOrEmpty(schemes) && searchParameters[key][0] > 0) //don't display experts with no pricing scheme when search price range > 0
                                    return q.reject();

                                return q.resolve(true);
                            });

                    case ApiConstants.EXPERIENCE_RANGE:
                        break;

                    case ApiConstants.AVAILIBILITY:
                        return self.scheduleDelegate.getSchedulesForUser(expert.getId())
                            .then(
                            function schedulesFetched(schedules:Schedule[])
                            {
                                if (!expert.isCurrentlyAvailable(schedules))
                                    return q.reject();
                                return q.resolve(true);
                            });

                    case ApiConstants.USER_SKILL:
                        return expert.getSkill()
                            .then(
                            function skillsFetched(skills:UserSkill[])
                            {
                                var expertSkills = _.map(skills, function (skill:any)
                                {
                                    return skill.skill.skill;
                                });

                                var isValid = false;
                                _.each(searchParameters[key], function (skill)
                                {
                                    if (_.indexOf(expertSkills, skill) != -1)
                                        isValid = true;
                                })

                                if (!isValid)
                                    return q.reject();

                                return q.resolve(true);
                            });
                }
            }))
                .then(
                function allPassed() { return expert; },
                function failed() { return null; }
            );
        }))
            .then(
            function filtersApplied(...args)
            {
                return args[0];
            });
    }
}
export = SearchDelegate