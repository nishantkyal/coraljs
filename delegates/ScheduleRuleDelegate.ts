import moment                                           = require('moment');
import _                                                = require('underscore');
import q                                                = require('q');
import parser                                           = require('cron-parser');
import BaseDaoDelegate                                  = require('./BaseDaoDelegate');
import ScheduleExceptionDelegate                        = require('../delegates/ScheduleExceptionDelegate');
import IntegrationMemberDelegate                        = require('../delegates/IntegrationMemberDelegate');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');
import ScheduleRuleDao                                  = require('../dao/ScheduleRuleDao');
import ScheduleExceptionDao                             = require('../dao/ScheduleExceptionDao');
import ScheduleRule                                     = require('../models/ScheduleRule');
import ScheduleException                                = require('../models/ScheduleException');
import Schedule                                         = require('../models/Schedule');
import CronRule                                         = require('../models/CronRule');
import DayName                                          = require('../enums/DayName');
import Utils                                            = require('../common/Utils');

class ScheduleRuleDelegate extends BaseDaoDelegate
{
    constructor() { super(new ScheduleRuleDao()); }

    create(newScheduleRule:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var createProxy = super.create;

        var options = {
            startDate: moment().valueOf(),
            endDate: moment().add({year: 1}).valueOf()
        };

        return this.getRulesByUser(newScheduleRule.getUserId(), options.startDate, options.endDate)
            .then(
            function createRecord(rules:ScheduleRule[])
            {
                self.logger.debug('Checking new rule for conflicts with old rules. options: %s', JSON.stringify(options));
                return newScheduleRule.hasConflicts(rules, options);
            })
            .then(
            function conflictsChecked(hasConflicts):any
            {
                self.logger.debug('Conflicts checked %s', hasConflicts);
                if (hasConflicts)
                    return q.reject('The rule settings entered conflict with an existing rule');
                else
                    return createProxy.call(self, newScheduleRule, transaction);
            });
    }

    createDefaultRules(expertId:number, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        var self = this;

        var weekdaysRule = new ScheduleRule();
        weekdaysRule.setTitle('Weekdays');
        weekdaysRule.setRepeatStart(moment().valueOf());
        weekdaysRule.setCronRule('0 0 11 * * 1-5');
        weekdaysRule.setDuration(8 * 3600 * 1000);
        weekdaysRule.setUserId(expertId);

        var weekendRule = new ScheduleRule();
        weekendRule.setTitle('Weekend');
        weekendRule.setRepeatStart(moment().valueOf());
        weekendRule.setCronRule('0 0 14 * * 0,6');
        weekendRule.setDuration(3 * 3600 * 1000);
        weekendRule.setUserId(expertId);

        return q.all([
            self.create(weekdaysRule, transaction),
            self.create(weekendRule, transaction)
        ]).fail(
            function rulesCreateFailed(error)
            {
                throw(error);
            }
        );
    }

    update(criteria:Object, updatedScheduleRule:ScheduleRule, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var ruleId = updatedScheduleRule.getId();
        var updateProxy = super.update;

        var options = {
            startDate: moment().valueOf(),
            endDate: moment().add({year: 1}).valueOf()
        };

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        return this.getRulesByUser(updatedScheduleRule.getUserId(), options.startDate, options.endDate, null, transaction)
            .then(
            function updateRecord(rawschedules)
            {
                var schedules:ScheduleRule[] = [];
                _.each(rawschedules, function (schedule:any)
                {
                    var temp = new ScheduleRule(schedule);
                    if (temp.getId() != updatedScheduleRule.getId()) // exclude the rule which is being updated while checking for conflicts
                        schedules.push(temp);
                });
                return updatedScheduleRule.hasConflicts(schedules, options)
                    .then(
                    function conflictsChecked(hasConflicts):any
                    {
                        self.logger.debug('Conflicts checked %s', hasConflicts);
                        if (hasConflicts)
                            throw new Error('Conflicts detected');
                        else
                            return updateProxy.call(self, {'id': ruleId}, updatedScheduleRule, transaction);
                    });
            })
            .then(
            function ruleUpdated()
            {
                var scheduleExceptionDelegate = new ScheduleExceptionDelegate();
                return scheduleExceptionDelegate.deleteByRuleId(ruleId, transaction, false)
            })
            .fail(
            function (error)
            {
                self.logger.debug('Error in deleting exceptions for ruleId - ' + ruleId + error);
                throw error;
            });
    }

    getRulesByUser(userId:number, startTime?:number, endTime?:number, fields:string[] = ScheduleRule.PUBLIC_FIELDS, transaction?:Object):q.Promise<any>
    {
        var expertScheduleRuleDao:any = this.dao;
        return expertScheduleRuleDao.getRulesByUser(userId, startTime, endTime, fields, transaction);
    }

    delete(scheduleRuleId:number, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        return super.delete(scheduleRuleId, transaction, false)
            .then(
            function ruleDeleted()
            {
                var scheduleExceptionDelegate = new ScheduleExceptionDelegate();
                return scheduleExceptionDelegate.deleteByRuleId(scheduleRuleId, transaction, false);
            });
    }

    applyExceptions(schedules:Schedule[], exceptions:ScheduleException[]):Schedule[]
    {
        return _.filter(schedules, function (schedule:Schedule)
        {
            var applicableExceptions = _.filter(exceptions, function (exception:ScheduleException)
            {
                if (exception.conflicts(schedule))
                    return true;
                else
                    return false;
            });

            if (!Utils.isNullOrEmpty(applicableExceptions) && applicableExceptions.length != 0)
                return true;
            else
                return false;
        });
    }

}
export = ScheduleRuleDelegate