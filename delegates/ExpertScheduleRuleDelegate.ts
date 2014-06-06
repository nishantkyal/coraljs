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
import CronRule                                         = require('../models/CronRule');
import DayName                                          = require('../enums/DayName');
import Utils                                            = require('../common/Utils');

class ExpertScheduleRuleDelegate extends BaseDaoDelegate
{
    constructor() { super(new ExpertScheduleRuleDao()); }

    private static DAY:string           = 'day';
    private static START_HOUR:string    = 'startHour';
    private static START_MINUTE:string  = 'startMinute';
    private static END_HOUR:string      = 'endHour';
    private static END_MINUTE:string    = 'endMinute';
    private static PRICE_UNIT:string    = 'priceUnit';
    private static PRICE_PER_MIN:string = 'pricePerMin';
    private static TITLE:string         = 'title';

    create(newScheduleRule:any, transaction?:Object):q.Promise<any>
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
                    return q.reject('Conflicts detected');
                else
                    return createProxy.call(self, newScheduleRule, transaction);
            });
    }

    createDefaultRules(expertId:number, transaction?:Object):q.Promise<any>
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

    createRuleFromTimeSlots(integration_member_id:number, slot:any):ExpertScheduleRule
    {
        var self = this;
        var cronRule:CronRule = new CronRule();
        var duration:number = (parseInt(slot[ExpertScheduleRuleDelegate.END_HOUR])*60 + parseInt(slot[ExpertScheduleRuleDelegate.END_MINUTE]))
            - (parseInt(slot[ExpertScheduleRuleDelegate.START_HOUR])*60 + parseInt(slot[ExpertScheduleRuleDelegate.START_MINUTE]));;

        var day:number = parseInt(slot[ExpertScheduleRuleDelegate.DAY]);
        if (day >= DayName.SUNDAY && day <= DayName.SATURDAY)
            cronRule.setDayOfWeek(slot[ExpertScheduleRuleDelegate.DAY]);
        else if(day == DayName.WEEKDAYS)
            cronRule.setDayOfWeek('1-5');
        else if(day == DayName.WEEKENDS)
            cronRule.setDayOfWeek('0,6');

        cronRule.setHour(slot[ExpertScheduleRuleDelegate.START_HOUR]);
        cronRule.setMinute(slot[ExpertScheduleRuleDelegate.START_MINUTE]);
        cronRule.setSecond('0');

        cronRule.setMonth('*');
        cronRule.setDayOfMonth('*');

        var scheduleRule:ExpertScheduleRule = new ExpertScheduleRule();
        scheduleRule.setCronRule(cronRule.toString());
        scheduleRule.setDuration(duration * 60 * 1000);
        scheduleRule.setIntegrationMemberId(integration_member_id);
        scheduleRule.setRepeatEnd(0);
        scheduleRule.setRepeatStart(moment().valueOf());
        scheduleRule.setPricePerMin(parseInt(slot[ExpertScheduleRuleDelegate.PRICE_PER_MIN]));
        scheduleRule.setPriceUnit(parseInt(slot[ExpertScheduleRuleDelegate.PRICE_UNIT]));
        scheduleRule.setTitle(slot[ExpertScheduleRuleDelegate.TITLE]);

        return scheduleRule;
    }

    update(criteria:Object, updatedScheduleRule:ExpertScheduleRule, transaction?:Object):q.Promise<any>
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
                updatedScheduleRule.hasConflicts(schedules, options)
                .then(
                function conflictsChecked(hasConflicts):any
                {
                    self.logger.debug('Conflicts checked %s', hasConflicts);
                    if (hasConflicts)
                        return q.reject('Conflicts detected');
                    else
                        return updateProxy.call(self, {'id': ruleId}, updatedScheduleRule, transaction);
                });
            })
            .then(
            function ruleUpdated()
            {
                var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
                return expertScheduleExceptionDelegate.deleteByRuleId(ruleId, transaction, false)
                    .fail( function (error){
                        self.logger.debug('Error in deleting exceptions for ruleId - ' + ruleId + error);
                    })
            });
    }

    getRulesByIntegrationMemberId(integrationMemberId:number, startTime?:number, endTime?:number, transaction?:Object):q.Promise<any>
    {
        var expertScheduleRuleDao:any = this.dao;
        return expertScheduleRuleDao.getRulesByIntegrationMemberId(integrationMemberId, startTime, endTime, transaction);
    }

    delete(scheduleRuleId:number, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        return super.delete(scheduleRuleId, transaction, false)
            .then(
            function ruleDeleted()
            {
                var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
                return expertScheduleExceptionDelegate.deleteByRuleId(scheduleRuleId, transaction,false);
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