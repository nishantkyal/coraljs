import _                                                    = require('underscore');
import q                                                    = require('q');
import moment                                               = require('moment');
import WidgetExpert                                         = require('../models/WidgetExpert');
import User                                                 = require('../models/User');
import Schedule                                             = require('../models/Schedule');
import PricingScheme                                        = require('../models/PricingScheme');
import WidgetExpertCache                                    = require('../caches/WidgetExpertCache');
import UserDelegate                                         = require('../delegates/UserDelegate');
import ScheduleDelegate                                     = require('../delegates/ScheduleDelegate');
import TimezoneDelegate                                     = require('../delegates/TimezoneDelegate');
import PricingSchemeDelegate                                = require('../delegates/PricingSchemeDelegate');
import Utils                                                = require('../common/Utils');
import IncludeFlag                                          = require('../enums/IncludeFlag');

class WidgetExpertDelegate
{
    private widgetExpertCache = new WidgetExpertCache();
    private userDelegate = new UserDelegate();
    private scheduleDelegate = new ScheduleDelegate();
    private pricingSchemeDelegate = new PricingSchemeDelegate();

    get(userId:number):q.Promise<any>
    {
        var self = this;

        return self.widgetExpertCache.get(userId)
            .then(
            function widgetExpertFetchedFromCache(widgetExpert:WidgetExpert)
            {
                if (Utils.isNullOrEmpty(widgetExpert))
                    throw('Not found in cache');
                return widgetExpert;
            })
            .fail(
            function widgetExpertFetchFailed():any
            {
                return self.userDelegate.get(userId);
            })
            .then(
            function expertFetched(user:User):any
            {
                return [
                    user,
                    self.scheduleDelegate.getSchedulesForUser(user.getId(), moment().subtract({days: 1}).valueOf(), moment().add({days: 7}).valueOf()),
                    self.pricingSchemeDelegate.search(Utils.createSimpleObject(PricingScheme.USER_ID, user.getId()))
                ];
            })
            .spread(
            function schedulesFetched(user:User, schedules:Schedule[], schemes:PricingScheme[])
            {
                user.setSchedule(schedules);

                var widgetExpert = new WidgetExpert(user);
                self.widgetExpertCache.save(widgetExpert);

                var timezone = new TimezoneDelegate().get(widgetExpert.getTimezone());
                widgetExpert.setTimezoneOffset(timezone['gmt_offset']);
                if (!Utils.isNullOrEmpty(schemes))
                    widgetExpert.setPricingScheme(schemes[0]);

                return widgetExpert;
            });
    }

}
export = WidgetExpertDelegate