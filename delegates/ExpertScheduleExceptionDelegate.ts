///<reference path='../_references.d.ts'/>
import moment                       = require('moment');
import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import ExpertScheduleExceptionDao   = require('../dao/ExpertScheduleExceptionDao');
import ExpertSchedule               = require('../models/ExpertSchedule');
import ExpertScheduleRule           = require('../models/ExpertScheduleRule');
import ExpertScheduleException      = require('../models/ExpertScheduleException');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import ExpertScheduleRuleDelegate   = require('../delegates/ExpertScheduleRuleDelegate');

class ExpertScheduleExceptionDelegate extends BaseDaoDelegate
{
    constructor() { super(new ExpertScheduleExceptionDao()); }

    createException(newScheduleException:ExpertScheduleException, transaction?:Object):q.Promise<any>
    {
        var self = this;
        // TODO: Handle cyclic dependencies in a better way
        var ExpertScheduleRuleDelegate = require('../delegates/ExpertScheduleRuleDelegate');
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();

        var currentDate = moment().valueOf();
        var dateAfterOneYear = moment().add({year: 1}).valueOf();

        return expertScheduleRuleDelegate.getRulesByIntegrationMemberId(newScheduleException.getIntegrationMemberId(), currentDate, dateAfterOneYear)
            .then(
            function createRecord(rules:ExpertScheduleRule[])
            {
                var schedules:ExpertScheduleRule[] = [];
                _.each(rules, function (schedule:any)
                {
                    schedules.push(new ExpertScheduleRule(schedule));
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

    validateException(scheduleRules:ExpertScheduleRule[], options, exception:ExpertScheduleException):q.Promise<any>
    {
        return q.all(_.map(scheduleRules, function (rule)
        {
            var ExpertScheduleDelegate = require('../delegates/ExpertScheduleDelegate');
            var expertScheduleDelegate = new ExpertScheduleDelegate();

            return expertScheduleDelegate.getSchedulesForRule(rule, moment(options.currentDate).valueOf(), moment(options.endDate).valueOf())
                .then(
                function schedulesGenerated(schedules:ExpertSchedule[])
                {
                    _.each(schedules, function(schedule)
                    {
                        if (schedule.conflicts(exception))
                            throw('Conflict');
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
        var expertScheduleExceptionDao:any = this.dao;
        return expertScheduleExceptionDao.getExceptionByIntegrationMemberId(expertId, startTime, endTime);
    }

    updateException(updatedScheduleRuleException:ExpertScheduleException, transaction?:Object):q.Promise<any>
    {
        var self = this;
        // TODO: Handle cyclic dependencies in a better way
        var ExpertScheduleRuleDelegate = require('../delegates/ExpertScheduleRuleDelegate');
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();

        var options =
        {
            startDate: moment().toDate(),
            endDate: moment().add('years', 1).toDate()
        };

        return expertScheduleRuleDelegate.getRulesByIntegrationMemberId(updatedScheduleRuleException.getIntegrationMemberId(), options.startDate.getTime() / 1000, options.endDate.getTime() / 1000)
            .then(//TODO handle conversion to sec
            function createRecord(rawschedules:ExpertScheduleRule[])
            {
                var schedules:ExpertScheduleRule[] = [];
                _.each(rawschedules, function (schedule:any)
                {
                    schedules.push(new ExpertScheduleRule(schedule));
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
export = ExpertScheduleExceptionDelegate