///<reference path='../_references.d.ts'/>
import _                                = require('underscore');
import q                                = require('q');
import BaseDaoDelegate                  = require('./BaseDaoDelegate');
import IDao                             = require('../dao/IDao');
import ExpertScheduleRuleDao            = require('../dao/ExpertScheduleRuleDao');
import ExpertScheduleRule               = require('../models/ExpertScheduleRule');
import ExpertScheduleExceptionDelegate  = require('../delegates/ExpertScheduleExceptionDelegate');
import ExpertScheduleExceptionDao       = require('../dao/ExpertScheduleExceptionDao');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import parser                           = require('../parser.js');


class ExpertScheduleRuleDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new ExpertScheduleRuleDao(); }
    create(newScheduleRule:any, transaction?:any):q.Promise<any>
    {
        var self = this;
        var expertScheduleRuleDao:any = this.getDao();
        var existingRules = this.getRulesByIntegrationMemberId(newScheduleRule.getIntegrationMemberId());
        return existingRules.then
        (
            function createRecord(schedules)
            {
                var options = {
                    startDate: new Date(parseInt(newScheduleRule.getRepeatStart())),
                    endDate: new Date(parseInt(newScheduleRule.getRepeatEnd()))
                };
                if (!self.hasConflicts(self, schedules, newScheduleRule, options))
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

    hasConflicts(self, schedules, newScheduleRule, options):boolean
    {
        var generatedSchedules = self.expertScheduleGenerator(schedules,options);
        var newGeneratedSchedules = self.expertScheduleGenerator([newScheduleRule], options);
        var conflict = false;
        _.each(generatedSchedules, function(existingSchedule){
            _.each(newGeneratedSchedules, function(newSchedule){
                if(newSchedule.date >= existingSchedule.date)
                    if(newSchedule.date.getTime() <= (existingSchedule.date.getTime() + existingSchedule.duration*60000))
                    {
                        conflict = true;
                        //TODO find a way to break the loop
                    }
            });
        });
        return conflict;
    }

    expertScheduleGenerator(scheduleRules:ExpertScheduleRule[], options):any
    {
        var schedules = [];
        if(scheduleRules.length == 0)
        {
            scheduleRules:[scheduleRules];
        }
        var expertId = scheduleRules[0].getIntegrationMemberId();
        var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();
        return expertScheduleExceptionDelegate.getExceptionsbyExpertId(options, expertId)
            .then
        (
            function createSchedules(exceptions) {
                for (var i = 0; i < scheduleRules.length; i++) {
                    parser.parseExpression(scheduleRules[i].getCronRule(), options, function (err, interval) {
                        if (err) {
                            console.log('Error: ' + err.message);
                            return;
                        }
                        console.log('RuleID:', scheduleRules[i].getRuleId());
                        console.log('Rule:', scheduleRules[i].getCronRule());
                        var t = new Date();
                        while ((t = interval.next())) {
                            console.log('StartTime: ', t.getTime());
                            console.log('Endtime', t.getTime()+scheduleRules[i].getDuration()*60000);
                            schedules.push({date: t, duration: scheduleRules[i].getDuration()});
                        }
                    });
                }
                var inException = false;
                schedules = _.filter(schedules, function (schedule) {
                    for (var i = 0; i < exceptions.length; i++) {
                        console.log('Exception:', exceptions[i].start_time);
                        if ((exceptions[i].start_time >= schedule.date.getTime()) && (exceptions[i].start_time <= schedule.date.getTime() + schedule.duration * 60000)) {
                            return false;
                        }
                    }
                    return true;
                });
                console.log('Done');
                return schedules;
            }
        )
    }
}
export = ExpertScheduleRuleDelegate