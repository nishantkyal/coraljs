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
    public getDate()
    {
        return this.date;
    }
    public getDuration()
    {
        return this.duration;
    }
    public setDate(d:number)
    {
        this.date = d;
    }
    public setDuration(d:number)
    {
        this.duration = d;
    }
}
class ExpertScheduleRuleDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new ExpertScheduleRuleDao(); }
    create(newScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var expertScheduleRuleDao:any = this.getDao();
        var existingRules = this.getRulesByIntegrationMemberId(newScheduleRule.getIntegrationMemberId());
        return existingRules
            .then
        (
            function createRecord(schedules:ExpertScheduleRule[])
            {
                var options = {
                    startDate: new Date(newScheduleRule.getRepeatStart()),
                    endDate: new Date(newScheduleRule.getRepeatEnd())
                };
                if (!self.hasConflicts(schedules, newScheduleRule, options))
                    return self.getDao().create(newScheduleRule, transaction);
                else
                    throw {
                        'message': 'Conflicting schedule rules found',
                        'conflicts': schedules
                    };
            }
        );
    }

    getRulesByIntegrationMemberId(integrationMemberId:number):q.Promise<any>
    {
        return this.getDao().search({'integration_member_id': integrationMemberId});
    }

    updateRule(updatedScheduleRule:ExpertScheduleRule, transaction?:any):q.Promise<any>
    {
        var self = this;
        var transaction = null;
        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                return self.getDao().update({'id': updatedScheduleRule.getId()}, updatedScheduleRule, transaction);
            })
            .then(
            function ruleUpdated()
            {
                var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
                return expertScheduleExceptionDelegate.deleteByRuleId(updatedScheduleRule.getId(), transaction);
            })
            .then(
            function exceptionsDeleted()
            {
                return MysqlDelegate.commit(transaction, updatedScheduleRule);
            })
    }

    deleteRule(scheduleRuleId, transaction?:any):q.Promise<any>
    {
        var self = this;
        var transaction = null;
        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                return self.getDao().delete(scheduleRuleId, true, transaction);
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

    hasConflicts(schedules:ExpertScheduleRule[], newScheduleRule:ExpertScheduleRule, options):boolean
    {
        var self = this;
        var generatedSchedules = self.expertScheduleGenerator(schedules,null, options);
        var newGeneratedSchedules = self.expertScheduleGenerator([newScheduleRule],null, options);
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

    expertScheduleGenerator(scheduleRules:ExpertScheduleRule[],exceptions:ExpertScheduleException[], options):any
    {
        var schedules = [];
        if(scheduleRules.length == 0)
        {
            scheduleRules:[scheduleRules];
        }
        var expertId = scheduleRules[0].getIntegrationMemberId();
        for (var i = 0; i < scheduleRules.length; i++) {
            parser.parseExpression(scheduleRules[i].getCronRule(), options, function (err, interval:any) {
                if (err) {
                    console.log('Error: ' + err.message);
                    return;
                }
                console.log('RuleID:', scheduleRules[i].getRuleId());
                console.log('Rule:', scheduleRules[i].getCronRule());
                var t;
                while ((t = interval.next())) {
                    console.log('StartTime: ', t.getTime());
                    console.log('Endtime', t.getTime()+scheduleRules[i].getDuration());
                    var temp = new GeneratedSchedules();
                    temp.setDate(t.getTime());
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
    applyExceptions(schedules, exceptions:ExpertScheduleException[]):GeneratedSchedules[]
    {
        schedules = _.filter(schedules, function (schedule:GeneratedSchedules) {
            for (var i = 0; i < exceptions.length; i++)
            {
                console.log('Exception:', exceptions[i].start_time);
                //TODO use getStartTime() not start_time
                if ((exceptions[i].start_time >= schedule.getDate()) && (exceptions[i].start_time <= schedule.getDate() + schedule.getDuration()))
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