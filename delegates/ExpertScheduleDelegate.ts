import q                                                                = require('q');
import moment                                                           = require('moment');
import _                                                                = require('underscore');
import cron_parser                                                      = require('cron-parser');
import ExpertScheduleRuleDelegate                                       = require('../delegates/ExpertScheduleRuleDelegate');
import TimezoneDelegate                                                 = require('../delegates/TimezoneDelegate');
import ExpertScheduleRule                                               = require('../models/ExpertScheduleRule');
import IntegrationMember                                                = require('../models/IntegrationMember');
import ExpertSchedule                                                   = require('../models/ExpertSchedule');
import Utils                                                            = require('../common/Utils');
import IncludeFlag                                                      = require('../enums/IncludeFlag');

class ExpertScheduleDelegate
{
    getSchedulesForExpert(expertId:number, startTime?:number, endTime?:number):q.Promise<any>
    {//TODO[ankit] handle array inout in getSchedulesForExpert
        var self = this;
        startTime = startTime || moment().valueOf();
        endTime = endTime || moment(startTime).add({days: 30}).valueOf();

        var IntegrationMemberDelegate:any = require('../delegates/IntegrationMemberDelegate');

        return q.all([
            new ExpertScheduleRuleDelegate().getRulesByIntegrationMemberId(expertId, startTime, endTime),
            new IntegrationMemberDelegate().get(expertId, null, [IncludeFlag.INCLUDE_USER])
            .then(
                function expertFetched(expert:IntegrationMember)
                {
                    return new TimezoneDelegate().getTimezone(expert.getUser().getTimezone());
                })
        ])
            .then(
            function rulesFetched(...args)
            {
                var rules:ExpertScheduleRule[] = args[0][0];
                var timezone = args[0][1];
                var offsetInSecs = timezone['gmt_offset'];
                var offsetInMillis = offsetInSecs * 1000;

                return q.all(_.map(rules, function (rule)
                {
                    return self.getSchedulesForRule(rule, startTime, endTime, offsetInMillis);
                }));
            })
            .then(
            function schedulesGenerated(...args)
            {
                try
                {
                    var allSchedules = _.reduce(args[0], function (a:any, b:any)
                    {
                        return a.concat(b);
                    }, []);

                    var sortedSchedules = _.sortBy(allSchedules, function (schedule:ExpertSchedule)
                    {
                        return schedule.getStartTime();
                    });

                    return sortedSchedules;
                } catch (e)
                {
                    return null;
                }
            });
    }

    getSchedulesForRule(rule:ExpertScheduleRule, startTime:number, endTime:number, gmtOffsetInMillis:number):q.Promise<any>
    {
        var deferred = q.defer();

        var options = {
            currentDate: moment(Math.max(startTime, rule.getRepeatStart())).toDate(),
            endDate: moment(!Utils.isNullOrEmpty(rule.getRepeatEnd()) && rule.getRepeatEnd() != 0 ? Math.min(endTime, rule.getRepeatEnd()) : endTime).toDate()
        };

        cron_parser.parseExpression(rule.getCronRule(), options, function schedulesGenerated(err, interval:cron_parser.CronExpression):any
        {
            if (err)
                deferred.reject(err);
            else
            {
                var t:Date, schedules:ExpertSchedule[] = [];
                try
                {
                    while (t = interval.next())
                    {
                        var expertSchedule = new ExpertSchedule();
                        expertSchedule.setStartTime(moment(t).add({millis: gmtOffsetInMillis}).valueOf());
                        expertSchedule.setDuration(rule.getDuration());
                        expertSchedule.setScheduleRuleId(rule.getId());
                        expertSchedule.setPricePerMin(rule.getPricePerMin());
                        expertSchedule.setPriceUnit(rule.getPriceUnit());
                        expertSchedule.setMinDuration(rule.getMinDuration());
                        schedules.push(expertSchedule);
                    }
                } catch (e)
                {
                    // Not catching here since the ihe loops exit by crashing when the interval limit is reached
                }
                deferred.resolve(schedules);
            }
        });

        return deferred.promise;
    }
}
export = ExpertScheduleDelegate