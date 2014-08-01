///<reference path='../_references.d.ts'/>
import moment                       = require('moment');
import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import ScheduleExceptionDao         = require('../dao/ScheduleExceptionDao');
import Schedule                     = require('../models/Schedule');
import ScheduleRule                 = require('../models/ScheduleRule');
import ScheduleException            = require('../models/ScheduleException');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import ScheduleRuleDelegate         = require('ScheduleRuleDelegate');

class ScheduleExceptionDelegate extends BaseDaoDelegate
{
    constructor() { super(new ScheduleExceptionDao()); }

    createException(newScheduleException:ScheduleException, transaction?:Object):q.Promise<any>
    {
        var self = this;
        // TODO: Handle cyclic dependencies in a better way
        var ScheduleRuleDelegate = require('ScheduleRuleDelegate');
        var scheduleRuleDelegate = new ScheduleRuleDelegate();

        var currentDate = moment().valueOf();
        var dateAfterOneYear = moment().add({year: 1}).valueOf();

        return scheduleRuleDelegate.getRulesByUser(newScheduleException.getUserId(), currentDate, dateAfterOneYear)
            .then(
            function createRecord(rules:ScheduleRule[])
            {
                var schedules:ScheduleRule[] = [];
                _.each(rules, function (schedule:any)
                {
                    schedules.push(new ScheduleRule(schedule));
                });

                var options =
                {
                    startDate: newScheduleException.getStartTime(),
                    endDate: newScheduleException.getStartTime()
                }

                if (self.validateException(schedules, options, newScheduleException))
                    return self.create(newScheduleException, transaction);
                else
                    throw {
                        'message': 'Invalid Exception - No rule exists for such exception ',
                        'Existing schedules Rules': schedules
                    };
            }
        );
    }

    validateException(scheduleRules:ScheduleRule[], options, exception:ScheduleException):q.Promise<any>
    {
        return q.all(_.map(scheduleRules, function (rule)
        {
            var ScheduleDelegate = require('ScheduleDelegate');
            var scheduleDelegate = new ScheduleDelegate();

            return scheduleDelegate.getSchedulesForRule(rule, moment(options.currentDate).valueOf(), moment(options.endDate).valueOf())
                .then(
                function schedulesGenerated(schedules:Schedule[])
                {
                    _.each(schedules, function(schedule)
                    {
                        if (schedule.conflicts(exception))
                            throw new Error('Conflict');
                    });
                });
        }));
    }

    deleteByRuleId(ruleId:number, transaction?:Object, softDelete?:boolean):q.Promise<any>
    {
        return this.delete({'schedule_rule_id': ruleId}, transaction, softDelete);
    }

    getExceptionsByIntegrationMemberId(expertId:number, startTime:number, endTime:number):q.Promise<any>
    {
        var scheduleExceptionDao:any = this.dao;
        return scheduleExceptionDao.getExceptionByIntegrationMemberId(expertId, startTime, endTime);
    }

    updateException(updatedScheduleRuleException:ScheduleException, transaction?:Object):q.Promise<any>
    {
        var self = this;
        // TODO: Handle cyclic dependencies in a better way
        var ScheduleRuleDelegate = require('ScheduleRuleDelegate');
        var scheduleRuleDelegate = new ScheduleRuleDelegate();

        var options =
        {
            startDate: moment().toDate(),
            endDate: moment().add('years', 1).toDate()
        };

        return scheduleRuleDelegate.getRulesByUser(updatedScheduleRuleException.getUserId(), options.startDate.getTime() / 1000, options.endDate.getTime() / 1000)
            .then(//TODO handle conversion to sec
            function createRecord(rawschedules:ScheduleRule[])
            {
                var schedules:ScheduleRule[] = [];
                _.each(rawschedules, function (schedule:any)
                {
                    schedules.push(new ScheduleRule(schedule));
                });

                options.startDate = new Date(updatedScheduleRuleException.getStartTime() * 1000);
                options.endDate = options.startDate;

                if (self.validateException(schedules, options, updatedScheduleRuleException))
                    return self.update({'id': updatedScheduleRuleException.getId()}, updatedScheduleRuleException, transaction);
                else
                    throw {
                        'message': 'Invalid Exception - No rule exists for such exception ',
                        'Existing schedules Rules': schedules
                    };
            }
        );
    }
}
export = ScheduleExceptionDelegate