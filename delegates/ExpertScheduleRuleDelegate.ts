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
    createRule(newScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var options = {
            startDate: moment().valueOf(),
            endDate: moment().add({year: 1}).valueOf()
        };
        var existingRules = this.getRulesByIntegrationMemberId(newScheduleRule.getIntegrationMemberId(), options.startDate, options.endDate);
        return existingRules
            .then(
            function createRecord(rules:ExpertScheduleRule[])
            {
                var schedules = [];
                _.each(rules, function(schedule:any){
                    schedules.push(new ExpertScheduleRule(schedule));
                });
                if (!newScheduleRule.hasConflicts(schedules , options))
                    return self.create(newScheduleRule, transaction);
                else
                    throw {
                        'message': 'Conflicting schedule rules found',
                        'conflicts': schedules
                    };
            }
        );
    }

    getRulesByIntegrationMemberId(integrationMemberId:number, startTime:number,  endTime:number, transaction?:any):q.Promise<any>
    {
        return this.getDao().getRuleById(integrationMemberId, startTime,  endTime, transaction);
    }

    updateRule(updatedScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var transaction = null;
        var ruleId = updatedScheduleRule.getId();

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
                _.each(rawschedules, function(schedule:any){
                    var temp = new ExpertScheduleRule(schedule);
                    if(temp.getId() != updatedScheduleRule.getId()) // exclude the rule which is being updated while checking for conflicts
                        schedules.push(temp);
                });
                if (!updatedScheduleRule.hasConflicts(schedules , options))
                    return self.update({'id': ruleId}, updatedScheduleRule, transaction);
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

    deleteRule(scheduleRuleId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var transaction = null;
        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                return self.delete(scheduleRuleId, true, transaction);
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
        schedules = _.filter(schedules, function (schedule:ExpertSchedule) {
            for (var i = 0; i < exceptions.length; i++)
            {
                if (exceptions[i].getStartTime() >= schedule.getStartTime())
                {
                    if(exceptions[i].getStartTime() <= schedule.getStartTime() + schedule.getDuration())
                    {
                        return false;
                        this.logger.debug('exception caught');
                    }
                }
                else if ((exceptions[i].getStartTime() + exceptions[i].getDuration()) > schedule.getStartTime())
                {
                    return false;
                    this.logger.debug('exception caught');
                }
            }
            return true;
        });
        return schedules;
    }

    expertScheduleGenerator(scheduleRule:ExpertScheduleRule,exceptions:ExpertScheduleException[], options):ExpertSchedule[]
    {
        var self = this;
        var schedules:ExpertSchedule[] = [];
        //parse all rules and generate schedules for given period
        parser.parseExpression(scheduleRule.getCronRule(), options, function (err, interval:any)
        {
            if (err)
            {
                self.logger.debug('Error: ' + err.message);
                console.log(err.message);
                return;
            }
            var t;
            while (t = interval.next())
            {
                var temp = new ExpertSchedule();
                temp.setStartTime(t.getTimeInSec());
                temp.setDuration(scheduleRule.getDuration());
                temp.setRuleId(scheduleRule.getId());
                schedules.push(temp);
            }
        });
        //in case exceptions are passed, apply them otherwise return the generated schedules
        //done to reuse code - same function is not being used in checking for conflicts and validateExceptions
        if(exceptions)
            return this.applyExceptions(schedules,  exceptions);
        else
            return schedules;
    }

    //function to check for conflicts using cron expression only without generating schedules.
    //not complete,
    /*private checkForConflicts(scheduleRules:ExpertScheduleRule[], newScheduleRule:ExpertScheduleRule, options):boolean
     {
     var self = this;
     var conflict:boolean = false;

     if (scheduleRules.length == 0)
     return conflict;

     var scheduleRulesFields:any = [];
     for (var i = 0; i < scheduleRules.length; i++)
     {
     var tempffields = parser.parseExpressionSync(scheduleRules[i].getCronRule(),options)['_fields'];
     tempffields['duration'] = scheduleRules[i].getDuration();
     scheduleRulesFields.push(tempffields);
     }
     var newschedulesFields = parser.parseExpressionSync(newScheduleRule.getCronRule(),options)['_fields'];
     newschedulesFields['duration'] = newScheduleRule.getDuration();

     conflict = self.checkForConflictsInExpression(scheduleRulesFields, newschedulesFields);
     //TO BE DONE  check fof fields for conflicts
     //ISSUE If in one rule day of month is specified and in another week of day then cannot detect conflict
     //ISSUE If one rule + duration crosses the day (say 11:00pm for 2 hours) then need to break it into two rules
     //to detect conflict
     return conflict;
     }

     private checkForConflictsInExpression(scheduleRulesFields:any[], newschedulesFields:any):boolean
     {
     var conflict:boolean = false;
     var map = ['dayOfMonth', 'month', 'dayOfWeek' ];

     var key:string = 'month';
     _.each(scheduleRulesFields, function(scheduleRuleFields:any)
     {
     _.each(scheduleRuleFields['month'], function(month)
     {
     _.each(newschedulesFields['month'], function(newScheduleMonth)
     {
     if(newScheduleMonth == month || newScheduleMonth == '*' || month == '*')
     {

     }
     })
     })
     });
     return conflict;
     }*/
}
export = ExpertScheduleRuleDelegate