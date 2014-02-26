///<reference path='../_references.d.ts'/>
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
import parser                           = require('cron-parser');
import MysqlDelegate                    = require('../delegates/MysqlDelegate');



class GeneratedSchedules
{
    date:number;
    duration:number;
    public getDate():number { return this.date;}
    public getDuration():number { return this.duration; }
    public setDate(d:number) { this.date = d; }
    public setDuration(d:number) { this.duration = d; }
}
class ExpertScheduleRuleDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new ExpertScheduleRuleDao(); }
    createRule(newScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var existingRules = this.getRulesByIntegrationMemberId(newScheduleRule.getIntegrationMemberId(), newScheduleRule.getRepeatStart(), newScheduleRule.getRepeatEnd());
        return existingRules
            .then(
            function createRecord(rawschedules:ExpertScheduleRule[])
            {
                var schedules:ExpertScheduleRule[] = [];
                _.each(rawschedules, function(schedule:any){
                    schedules.push(ExpertScheduleRule.toExpertScheduleRuleObject(schedule));
                });
                var options = {
                    startDate: new Date(newScheduleRule.getRepeatStart()*1000),
                    endDate: new Date(newScheduleRule.getRepeatEnd()*1000)
                };//TODO handle conversion to ms
                if (!self.hasConflicts(schedules, newScheduleRule, options))
                    return self.create(newScheduleRule, transaction);
                else
                    throw {
                        'message': 'Conflicting schedule rules found',
                        'conflicts': schedules
                    };
            }
        );
    }

    getRulesByIntegrationMemberId(integrationMemberId:number, startTime:number,  endTime:number):q.Promise<any>
    {
        return this.getDao().getRuleById(integrationMemberId, startTime,  endTime);
    }

    getRulesById(Id:number):q.Promise<any>
    {
        return this.search({'id': Id});
    }

    updateRule(updatedScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var transaction = null;
        var RuleId = updatedScheduleRule.getId();
        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                return self.update({'id': RuleId}, updatedScheduleRule, transaction);
            })
            .then(
            function ruleUpdated()
            {
                var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
                return expertScheduleExceptionDelegate.deleteByRuleId(RuleId, transaction);
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

    private hasConflicts(schedules:ExpertScheduleRule[], newScheduleRule:ExpertScheduleRule, options):boolean
    {
        if (schedules.length == 0)
            return false;
        var self = this;
        var generatedSchedules:GeneratedSchedules[] = self.expertScheduleGenerator(schedules,null, options);
        var newGeneratedSchedules:GeneratedSchedules[] = self.expertScheduleGenerator([newScheduleRule],null, options);
        var conflict = false;
        _.each(generatedSchedules, function(existingSchedule:GeneratedSchedules){
            _.each(newGeneratedSchedules, function(newSchedule:GeneratedSchedules){
                if(newSchedule.getDate() >= existingSchedule.getDate())
                    if(newSchedule.getDate() <= (existingSchedule.getDate() + existingSchedule.getDuration()))
                    {
                        conflict = true;
                        //TODO find a way to break the loop
                    }
            });
        });
        return conflict;
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

    validateException(scheduleRules:ExpertScheduleRule[], options, exception:ExpertScheduleException):boolean
    {
        var schedules:GeneratedSchedules[] = this.expertScheduleGenerator(scheduleRules,null, options);
        var schedulesAfterExceptions:GeneratedSchedules[] = this.applyExceptions(schedules, [exception]);
        return schedules.length != schedulesAfterExceptions.length;
    }

    private expertScheduleGenerator(scheduleRules:ExpertScheduleRule[],exceptions:ExpertScheduleException[], options):GeneratedSchedules[]
    {
        var schedules:GeneratedSchedules[] = [];
        if(scheduleRules.length == 0)
        {
            scheduleRules:[scheduleRules];
        }
        for (var i = 0; i < scheduleRules.length; i++) {
            parser.parseExpression(scheduleRules[i].getCronRule(), options, function (err, interval:any) {
                if (err) {
                    console.log('Error: ' + err.message);
                    return;
                }
                var t;
                while ((t = interval.next())) {
                    var temp = new GeneratedSchedules();
                    temp.setDate(t.getTimeInSec()); //TODO handle convertion to sec
                    temp.setDuration(scheduleRules[i].getDuration());
                    schedules.push(temp);
                }
            });
        }
        if(exceptions)
        {
            return this.applyExceptions(schedules,  exceptions);
        }
        else
            return schedules;
    }

    private applyExceptions(schedules:GeneratedSchedules[], exceptions:ExpertScheduleException[]):GeneratedSchedules[]
    {
        schedules = _.filter(schedules, function (schedule:GeneratedSchedules) {
            for (var i = 0; i < exceptions.length; i++)
            {
                if ((exceptions[i].getStartTime() >= schedule.getDate()) && (exceptions[i].getStartTime() <= schedule.getDate() + schedule.getDuration()))
                {
                    return false;
                    console.log('exception caught');
                }
            }
            return true;
        });
        console.log('Done');
        return schedules;
    }
}
export = ExpertScheduleRuleDelegate