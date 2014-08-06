import log4js                                                           = require('log4js');
import q                                                                = require('q');
import moment                                                           = require('moment');
import _                                                                = require('underscore');
import cron_parser                                                      = require('cron-parser');
import ScheduleRuleDelegate                                             = require('../delegates/ScheduleRuleDelegate');
import TimezoneDelegate                                                 = require('../delegates/TimezoneDelegate');
import ScheduleRule                                                     = require('../models/ScheduleRule');
import User                                                             = require('../models/User');
import Schedule                                                         = require('../models/Schedule');
import Utils                                                            = require('../common/Utils');

class ScheduleDelegate
{
    private logger = log4js.getLogger(Utils.getClassName(this));

    getSchedulesForUser(userId:number, startTime?:number, endTime?:number):q.Promise<any>
    {
        //TODO[ankit] handle array inout in getSchedulesForExpert
        var self = this;
        startTime = startTime || moment().valueOf();
        endTime = endTime || moment(startTime).add({days: 30}).valueOf();

        var UserDelegate:any = require('../delegates/UserDelegate');

        return q.all([
            new ScheduleRuleDelegate().getRulesByUser(userId, startTime, endTime),
            new UserDelegate().get(userId)
        ])
            .then(
            function rulesFetched(...args)
            {
                var rules:ScheduleRule[] = args[0][0];
                var user:User = args[0][1];

                var timezone = new TimezoneDelegate().get(user.getTimezone());
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

                    var sortedSchedules = _.sortBy(allSchedules, function (schedule:Schedule)
                    {
                        return schedule.getStartTime();
                    });

                    return sortedSchedules;
                } catch (e)
                {
                    return null;
                }
            })
            .fail(
            function handleFailure(error:Error)
            {
                self.logger.error('Error occurred while getting schedules for used id: %s, error: %s', userId, error.message);
                throw error;
            });
    }

    getSchedulesForRule(rule:ScheduleRule, startTime:number, endTime:number, gmtOffsetInMillis:number):q.Promise<any>
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
                var t:Date, schedules:Schedule[] = [];
                try
                {
                    while (t = interval.next())
                    {
                        var expertSchedule = new Schedule();
                        expertSchedule.setStartTime(moment(t).subtract({milliseconds: gmtOffsetInMillis}).valueOf());
                        expertSchedule.setDuration(rule.getDuration());
                        expertSchedule.setScheduleRuleId(rule.getId());
                        expertSchedule.setPricingSchemeId(rule.getPricingSchemeId());
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
export = ScheduleDelegate