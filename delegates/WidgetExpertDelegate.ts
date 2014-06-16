import _                                                    = require('underscore');
import q                                                    = require('q');
import moment                                               = require('moment');
import WidgetExpert                                         = require('../models/WidgetExpert');
import IntegrationMember                                    = require('../models/IntegrationMember');
import Schedule                                             = require('../models/Schedule');
import PricingScheme                                        = require('../models/PricingScheme');
import WidgetExpertCache                                    = require('../caches/WidgetExpertCache');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import ScheduleDelegate                                     = require('../delegates/ScheduleDelegate');
import TimezoneDelegate                                     = require('../delegates/TimezoneDelegate');
import PricingSchemeDelegate                                = require('../delegates/PricingSchemeDelegate');
import Utils                                                = require('../common/Utils');
import IncludeFlag                                          = require('../enums/IncludeFlag');

class WidgetExpertDelegate
{
    private widgetExpertCache = new WidgetExpertCache();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private scheduleDelegate = new ScheduleDelegate();
    private pricingSchemeDelegate = new PricingSchemeDelegate();

    get(expertId:number):q.Promise<any>
    {
        var self = this;

        return self.widgetExpertCache.get(expertId)
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
                return self.integrationMemberDelegate.get(expertId, IntegrationMember.DEFAULT_FIELDS.concat(IntegrationMember.USER_ID), [IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function expertFetched(expert:IntegrationMember):any
            {
                return [
                    expert,
                    self.scheduleDelegate.getSchedulesForUser(expert.getUserId(), moment().subtract({days: 1}).valueOf(), moment().add({days: 1}).valueOf()),
                    self.pricingSchemeDelegate.search(Utils.createSimpleObject(PricingScheme.USER_ID, expert.getUserId()))
                ];
            })
            .spread(
            function schedulesFetched(expert:IntegrationMember, schedules:Schedule[], schemes:PricingScheme[])
            {
                expert.getUser().setSchedule(schedules);

                var widgetExpert = new WidgetExpert(expert);
                self.widgetExpertCache.save(widgetExpert);

                var timezone = new TimezoneDelegate().get(widgetExpert.getTimezone());
                widgetExpert.setTimezoneOffset(timezone['gmt_offset']);
                widgetExpert.setPricingScheme(schemes[0]);

                return widgetExpert;
            });
    }

}
export = WidgetExpertDelegate