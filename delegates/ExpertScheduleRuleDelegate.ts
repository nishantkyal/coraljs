///<reference path='../_references.d.ts'/>
import moment                                           = require('moment');
import _                                                = require('underscore');
import q                                                = require('q');
import parser                                           = require('cron-parser');
import BaseDaoDelegate                                  = require('./BaseDaoDelegate');
import ExpertScheduleExceptionDelegate                  = require('../delegates/ExpertScheduleExceptionDelegate');
import IntegrationMemberDelegate                        = require('../delegates/IntegrationMemberDelegate');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');
import ExpertScheduleRuleDao                            = require('../dao/ExpertScheduleRuleDao');
import ExpertScheduleExceptionDao                       = require('../dao/ExpertScheduleExceptionDao');
import ExpertScheduleRule                               = require('../models/ExpertScheduleRule');
import ExpertScheduleException                          = require('../models/ExpertScheduleException');
import ExpertSchedule                                   = require('../models/ExpertSchedule');
import Utils                                            = require('../common/Utils');

class ExpertScheduleRuleDelegate extends BaseDaoDelegate
{
    constructor() { super(new ExpertScheduleRuleDao()); }

    create(newScheduleRule:any, transaction?:any):q.Promise<any>
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
                self.logger.debug('Checking new rule for conflicts with old rules. options: %s', JSON.stringify(options));
                return newScheduleRule.hasConflicts(rules, options);
            })
            .then(
            function conflictsChecked(hasConflicts):any
            {
                self.logger.debug('Conflicts checked %s', hasConflicts);
                if (hasConflicts)
                    throw('Conflicts detected');
                else
                    return createProxy.call(self, newScheduleRule, transaction);
            });
    }

    createDefaultRules(expertId:number, transaction?:any):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        var self = this;

        var weekdaysRule = new ExpertScheduleRule();
        weekdaysRule.setTitle('Weekdays');
        weekdaysRule.setRepeatStart(moment().valueOf());
        weekdaysRule.setCronRule('0 0 11 * * 1-5');
        weekdaysRule.setDuration(8 * 3600 * 1000);
        weekdaysRule.setIntegrationMemberId(expertId);

        var weekendRule = new ExpertScheduleRule();
        weekendRule.setTitle('Weekend');
        weekendRule.setRepeatStart(moment().valueOf());
        weekendRule.setCronRule('0 0 2 * * 0,6');
        weekendRule.setDuration(3 * 3600 * 1000);
        weekendRule.setIntegrationMemberId(expertId);

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

    update(criteria:Object, updatedScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var transaction = null;
        var ruleId = updatedScheduleRule.getId();
        var updateProxy = super.update;

        var options = {
            startDate: moment().valueOf(),
            endDate: moment().add({year: 1}).valueOf()
        };

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        return this.getRulesByIntegrationMemberId(updatedScheduleRule.getIntegrationMemberId(), options.startDate, options.endDate, transaction)
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
            });
    }

    getRulesByIntegrationMemberId(integrationMemberId:number, startTime?:number, endTime?:number, transaction?:any):q.Promise<any>
    {
        var expertScheduleRuleDao:any = this.dao;
        return expertScheduleRuleDao.getRulesByIntegrationMemberId(integrationMemberId, startTime, endTime, transaction);
    }

    delete(scheduleRuleId:number, transaction?:any):q.Promise<any>
    {
        var transaction = null;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        return super.delete(scheduleRuleId, true, transaction)
            .then(
            function ruleDeleted()
            {
                var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
                return expertScheduleExceptionDelegate.deleteByRuleId(scheduleRuleId, transaction);
            });
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