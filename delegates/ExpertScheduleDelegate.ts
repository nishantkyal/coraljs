///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import moment                                       = require('moment');
import _                                            = require('underscore');
import cron_parser                                  = require('cron-parser');
import ExpertScheduleRuleDelegate                   = require('../delegates/ExpertScheduleRuleDelegate');
import ExpertScheduleRule                           = require('../models/ExpertScheduleRule');
import ExpertSchedule                               = require('../models/ExpertSchedule');

class ExpertScheduleDelegate
{
    getSchedulesForExpert(expertId:number, startTime?:number, endTime?:number):q.Promise<any>
    {
        var self = this;
        startTime = startTime || moment().valueOf();
        endTime = endTime || moment(startTime).add({'weeks': 1}).valueOf();

        return new ExpertScheduleRuleDelegate().getRulesByIntegrationMemberId(expertId, startTime, endTime)
            .then(
            function rulesFetched(rules:ExpertScheduleRule[])
            {
                return q.all(_.map(rules, function (rule)
                {
                    return self.getSchedulesForRule(rule, startTime, endTime);
                }));
            })
            .then(
            function schedulesGenerated(...args)
            {
                try {
                    return _.reduce(args[0], function (a:any, b:any) {
                        return a.concat(b);
                    }, []);
                } catch (e) {
                    return null;
                }
            });
    }

    getSchedulesForRule(rule:ExpertScheduleRule, startTime:number, endTime:number):q.Promise<any>
    {
        var deferred = q.defer();
        var options = {
            currentDate: moment(Math.max(startTime, rule.getRepeatStart())).toDate(),
            endDate: moment(Math.min(endTime, rule.getRepeatEnd())).toDate()
        };

        cron_parser.parseExpression(rule.getCronRule(), options, function schedulesGenerated(err, interval:cron_parser.CronExpression):any
        {
            if (err)
                deferred.reject(err);
            else
            {
                var t:Date, schedules:ExpertSchedule[] = [];
                try {
                    while (t = interval.next())
                    {
                        var temp = new ExpertSchedule();
                        temp.setStartTime(moment(t).valueOf());
                        temp.setDuration(rule.getDuration());
                        temp.setRuleId(rule.getId());
                        schedules.push(temp);
                    }
                } catch (e) {}
                deferred.resolve(schedules);
            }
        });

        return deferred.promise;
    }
}
export = ExpertScheduleDelegate