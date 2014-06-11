import _                                                    = require('underscore');
import q                                                    = require('q');
import moment                                               = require('moment');
import WidgetExpert                                         = require('../models/WidgetExpert');
import IntegrationMember                                    = require('../models/IntegrationMember');
import ExpertSchedule                                       = require('../models/ExpertSchedule');
import WidgetExpertCache                                    = require('../caches/WidgetExpertCache');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import ExpertScheduleDelegate                               = require('../delegates/ExpertScheduleDelegate');
import TimezoneDelegate                                     = require('../delegates/TimezoneDelegate');
import Utils                                                = require('../common/Utils');
import IncludeFlag                                          = require('../enums/IncludeFlag');

class WidgetExpertDelegate
{
    private widgetExpertCache = new WidgetExpertCache();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private expertScheduleDelegate = new ExpertScheduleDelegate();

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
                return q.all([
                    self.integrationMemberDelegate.get(expertId, IntegrationMember.DEFAULT_FIELDS.concat(IntegrationMember.USER_ID), [IncludeFlag.INCLUDE_USER]),
                    self.expertScheduleDelegate.getSchedulesForExpert(expertId, moment().subtract({days: 1}).valueOf(), moment().add({days: 1}).valueOf())
                ]);
            })
            .then(
            function expertFetched(...args):any
            {
                var expert:IntegrationMember = new IntegrationMember(args[0][0]);
                var schedules:ExpertSchedule[] = args[0][1];
                expert.setSchedule(schedules);

                var widgetExpert = new WidgetExpert(expert);
                self.widgetExpertCache.save(widgetExpert);

                var timezone = new TimezoneDelegate().getTimezone(widgetExpert.getTimezone());
                widgetExpert.setTimezoneOffset(timezone['gmt_offset']);

                return widgetExpert;
            });
    }

}
export = WidgetExpertDelegate