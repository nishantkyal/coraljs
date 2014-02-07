///<reference path='../_references.d.ts'/>
import _                                = require('underscore');
import q                                = require('q');
import BaseDAODelegate                  = require('../delegates/BaseDaoDelegate');
import UserDelegate                     = require('../delegates/UserDelegate');
import ExpertScheduleRuleDelegate       = require('../delegates/ExpertScheduleRuleDelegate');
import MysqlDelegate                    = require('../delegates/MysqlDelegate');
import ExpertScheduleDAO                = require('../dao/ExpertScheduleDao');
import ExpertSchedule                   = require('../models/ExpertSchedule');
import ExpertScheduleRule               = require('../models/ExpertScheduleRule');
import IntegrationMember                = require('../models/IntegrationMember');
import IDao                             = require('../dao/IDao');
import Utils                            = require('../common/Utils');
import ApiFlags                         = require('../enums/ApiFlags');

/**
 * Delegate class for expert schedules
 */
class ExpertScheduleDelegate extends BaseDAODelegate
{
    getDao():IDao { return new ExpertScheduleDAO(); }

    /* Get schedules for expert */
    getSchedulesForExpert(expertId:number, startTime?:number, endTime?:number):q.Promise<any>
    {
        var that = this;
        var schedules = [];

        var isStartTimeEmpty = Utils.isNullOrEmpty(startTime);
        var isEndTimeEmpty = Utils.isNullOrEmpty(endTime);
        var maxAllowedInterval = 604800000; // millis in a week

        if (isStartTimeEmpty && isEndTimeEmpty)
        {
            var today = new Date();
            startTime = today.getTime();
            endTime = startTime + maxAllowedInterval;
        } else if (isStartTimeEmpty)
            startTime = endTime - maxAllowedInterval;
        else if (isEndTimeEmpty)
            endTime = startTime + maxAllowedInterval;

        // 1. Search schedules
        // 2. If no schedules, try creating them based on defined rules for the period (if defined)
        return that.getDao().search(
            {
                'integration_member_id': expertId,
                'start_time': {
                    'operator': 'BETWEEN',
                    'value': [startTime, endTime]
                }
            })
            .then(
            function schedulesSearched(s:Array<ExpertSchedule>):any
            {
                schedules = s;
                if (schedules.length == 0 && startTime && endTime)
                    return that.createSchedulesForExpert(expertId, startTime, endTime);
                else
                    return schedules;
            });

    }

    /* Create new schedule */
    create(object:any, transaction?:any):q.Promise<any>
    {
        var that = this;

        // Don't create if schedule with same details already exists
        return this.search(object)
            .then(
            function handleScheduleSearched(schedules:Array<ExpertSchedule>)
            {
                if (schedules.length == 0)
                    return that.getDao().create(object, transaction);
                else
                    throw('Schedule already exists with the same details');
            }
        )
    }

    createSchedulesForExpert(integrationMemberId:number, startTime:number, endTime:number):q.Promise<any>
    {
        var rules = [];
        var transaction;
        var schedules = [];
        var that = this;

        return new ExpertScheduleRuleDelegate().getRulesByIntegrationMemberId(integrationMemberId)
            .then(
            function rulesSearched(rs:Array<ExpertScheduleRule>):any
            {
                rules = rs;
                if (rs.length != 0)
                    return MysqlDelegate.beginTransaction()
                        .then(
                        function transactionStarted(t)
                        {
                            transaction = t;
                            _.each(rules, function (rule:ExpertScheduleRule)
                            {
                                schedules = schedules.concat(that.generateSchedules(rule, integrationMemberId, startTime, endTime));
                            });

                            return q.all(_.map(schedules, function (schedule:ExpertSchedule)
                            {
                                return that.create(schedule, transaction);
                            }));
                        })
                        .then(
                        function schedulesCreated()
                        {
                            return MysqlDelegate.commit(transaction, schedules);
                        });
                else
                    return schedules;
            });
    }

    /* Helper method to generate schedules based on a given rule for an interval */
    generateSchedules(rule:ExpertScheduleRule, integrationMemberId:number, startTime:number, endTime:number):ExpertSchedule[]
    {
        var invalidData:boolean = !startTime || !endTime || !rule || !rule.isValid();
        var outOfRange:boolean = rule.getRepeatEnd() <= startTime || rule.getRepeatStart() >= endTime;
        var schedules = [];

        if (invalidData || outOfRange)
        {
            this.logger.error('Invalid data specified for generating schedules');
            return schedules;
        }

        if (rule.getRepeatCron())
        {
        }
        else if (rule.getRepeatInterval())
        {
            if (rule.getRepeatEnd())
                endTime = Math.min(endTime, rule.getRepeatEnd());
            startTime = Math.max(startTime, rule.getRepeatStart());

            for (var i = startTime; i <= endTime; i += rule.getRepeatInterval())
            {
                var eSchedule = new ExpertSchedule();
                eSchedule.setPricePerMin(rule.getPricePerMin());
                eSchedule.setPriceUnit(rule.getPriceUnit());
                eSchedule.setDuration(rule.getDuration());
                eSchedule.setStartTime(i);
                eSchedule.setIntegrationMemberId(integrationMemberId);
                eSchedule.setScheduleRuleId(rule.getId());
                schedules.push(eSchedule);
            }
        }

        return schedules;
    }

    getIncludeHandler(include:string, result:Object):q.Promise<any>
    {
        var userDelegate = new UserDelegate();
        var IntegrationMemberDelegate = require('../delegates/IntegrationMemberDelegate');
        var integrationMemberDelegate = new IntegrationMemberDelegate();
        var integrationMemberId = result['integration_member_id'];

        switch (include)
        {
            case ApiFlags.INCLUDE_USER:
                return integrationMemberDelegate.get(integrationMemberId, null, [ApiFlags.INCLUDE_USER]);
            case ApiFlags.INCLUDE_INTEGRATION_MEMBER:
                return integrationMemberDelegate.get(integrationMemberId);
        }

        return super.getIncludeHandler(include, result);
    }

}
export = ExpertScheduleDelegate