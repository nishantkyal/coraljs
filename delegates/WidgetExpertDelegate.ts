import _                                                    = require('underscore');
import q                                                    = require('q');
import moment                                               = require('moment');
import log4js                                               = require('log4js');
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

class WidgetExpertDelegate
{
    private widgetExpertCache = new WidgetExpertCache();
    private userDelegate = new UserDelegate();
    private scheduleDelegate = new ScheduleDelegate();
    private pricingSchemeDelegate = new PricingSchemeDelegate();
    private timezoneDelegate = new TimezoneDelegate();
    private logger = log4js.getLogger(Utils.getClassName(this));

    get(userId:number):q.Promise<any>
    {
        var self = this;

        return self.widgetExpertCache.get(userId)
            .then(
            function widgetExpertFetchedFromCache(widgetExpert:WidgetExpert)
            {
                if (Utils.isNullOrEmpty(widgetExpert))
                    throw new Error('Not found in cache');
                return widgetExpert;
            })
            .fail(
            function widgetExpertFetchFailed():any
            {
                return self.userDelegate.get(userId, null, [User.FK_USER_SKILL]);
            })
            .then(
            function expertFetched(user:User):any
            {
                return [
                    user,
                    self.scheduleDelegate.getSchedulesForUser(user.getId(), moment().subtract({days: 1}).valueOf(), moment().add({days: 7}).valueOf()),
                    self.pricingSchemeDelegate.search(Utils.createSimpleObject(PricingScheme.COL_USER_ID, user.getId()))
                ];
            })
            .spread(
            function schedulesFetched(user:User, schedules:Schedule[], schemes:PricingScheme[])
            {
                self.logger.debug('Schedules, pricing fetched for user id: %s', userId);

                var widgetExpert = new WidgetExpert(user, schedules);
                return [widgetExpert, schemes, self.widgetExpertCache.save(user, schedules)];
            })
            .spread(
            function widgetExpertCached(widgetExpert:WidgetExpert, schemes:PricingScheme[])
            {
                self.logger.debug('Widget expert cached for user id: %s', userId);

                var timezone = self.timezoneDelegate.get(widgetExpert.getTimezone());
                widgetExpert.setTimezoneOffset(timezone.getGmtOffset());
                if (!Utils.isNullOrEmpty(schemes))
                    widgetExpert.setPricingScheme(schemes[0]);

                return widgetExpert;
            })
            .fail(
            function handleFailure(error:Error)
            {
                self.logger.error('Error occurred while getting widget expert for user id: %s, error: %s', userId, error.message);
                throw error;
            });
    }

}
export = WidgetExpertDelegate