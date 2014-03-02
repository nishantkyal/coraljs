///<reference path='../_references.d.ts'/>
import moment                           = require('moment');
import _                                = require('underscore');
import q                                = require('q');
import BaseDaoDelegate                  = require('./BaseDaoDelegate');
import IDao                             = require('../dao/IDao');
import ExpertScheduleRuleDao            = require('../dao/ExpertScheduleRuleDao');
import ExpertScheduleRule               = require('../models/ExpertScheduleRule');
import ExpertScheduleException          = require('../models/ExpertScheduleException');
import ExpertScheduleExceptionDelegate  = require('../delegates/ExpertScheduleExceptionDelegate');
import ExpertScheduleExceptionDao       = require('../dao/ExpertScheduleExceptionDao');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import MysqlDelegate                    = require('../delegates/MysqlDelegate');
import ExpertSchedule                   = require('../models/ExpertSchedule');
import parser                           = require('cron-parser');


class ExpertScheduleRuleDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new ExpertScheduleRuleDao(); }

    create(newScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var createProxy = super.create;

        var options = {
            startDate: moment().valueOf(),
            endDate: moment().add({year: 1}).valueOf()
        };
        return this.getRulesByIntegrationMemberId(newScheduleRule.getIntegrationMemberId(), options.startDate, options.endDate)
            .then(
            function createRecord(rules:ExpertScheduleRule[])
            {
                return newScheduleRule.hasConflicts(rules, options);
            })
            .then(
            function conflictsChecked(hasConflicts):any
            {
                if (hasConflicts)
                    throw('Conflicts detected');
                else
                    return createProxy.call(self, newScheduleRule);
            });
    }

    createDefaultRules(expertId:number, transaction?:any):q.Promise<any>
    {
        var weekdaysRule = new ExpertScheduleRule();
        weekdaysRule.setTitle('Weekdays');
        weekdaysRule.setRepeatStart(moment().valueOf());
        weekdaysRule.setCronRule('0 0 9 * * 1-5');
        weekdaysRule.setDuration(12 * 3600);
        weekdaysRule.setIntegrationMemberId(expertId);

        var weekendRule = new ExpertScheduleRule();
        weekendRule.setTitle('Weekend');
        weekendRule.setRepeatStart(moment().valueOf());
        weekendRule.setCronRule('0 0 2 * * 0,6');
        weekendRule.setDuration(3 * 3600);
        weekendRule.setIntegrationMemberId(expertId);

        var self = this;

        return self.create(weekdaysRule, transaction)
            .then(
            function ruleCreated()
            {
                self.create(weekendRule, transaction)
            });
    }

    update(criteria:Object, updatedScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var transaction = null;
        var ruleId = updatedScheduleRule.getId();
        var updateProxy = super.update;

        var options = {
            startDate: moment().valueOf(),
            endDate: moment().add({year: 1}).valueOf()
        };

        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                return self.getRulesByIntegrationMemberId(updatedScheduleRule.getIntegrationMemberId(), options.startDate, options.endDate, transaction);
            })
            .then(
            function updateRecord(rawschedules)
            {
                var schedules:ExpertScheduleRule[] = [];
                _.each(rawschedules, function (schedule:any)
                {
                    var temp = new ExpertScheduleRule(schedule);
                    if (temp.getId() != updatedScheduleRule.getId()) // exclude the rule which is being updated while checking for conflicts
                        schedules.push(temp);
                });
                if (!updatedScheduleRule.hasConflicts(schedules, options))
                    return updateProxy.call(this, {'id': ruleId}, updatedScheduleRule, transaction);
                else
                    throw {
                        'message': 'Conflicting schedule rules found',
                        'conflicts': schedules
                    };
            })
            .then(
            function ruleUpdated()
            {
                var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
                return expertScheduleExceptionDelegate.deleteByRuleId(ruleId, transaction);
            })
            .then(
            function exceptionsDeleted()
            {
                return MysqlDelegate.commit(transaction, updatedScheduleRule);
            })
    }

    getRulesByIntegrationMemberId(integrationMemberId:number, startTime?:number, endTime?:number, transaction?:any):q.Promise<any>
    {
        var expertScheduleRuleDao:any = this.getDao();
        return expertScheduleRuleDao.getRulesByIntegrationMemberId(integrationMemberId, startTime, endTime, transaction);
    }

    delete(scheduleRuleId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var transaction = null;
        var deleteProxy = super.delete;

        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                return deleteProxy(scheduleRuleId, true, transaction);
            })
            .then(
            function ruleDeleted()
            {
                var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
                return expertScheduleExceptionDelegate.deleteByRuleId(scheduleRuleId, transaction);
            })
            .then(
            function exceptionsDeleted()
            {
                return MysqlDelegate.commit(transaction, scheduleRuleId);
            })
    }

    applyExceptions(schedules:ExpertSchedule[], exceptions:ExpertScheduleException[]):ExpertSchedule[]
    {
        return _.filter(schedules, function (schedule:ExpertSchedule)
        {
            _.each(exceptions, function (exception:ExpertScheduleException)
            {
                if (exception.conflicts(schedule))
                    return false;
            });
            return true;
        });
    }

}
export = ExpertScheduleRuleDelegate