///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import IDao                         = require('../dao/IDao');
import ExpertScheduleExceptionDao   = require('../dao/ExpertScheduleExceptionDao');
import ExpertScheduleRule           = require('../models/ExpertScheduleRule');
import ExpertScheduleException      = require('../models/ExpertScheduleException');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import ExpertScheduleRuleDelegate   = require('../delegates/ExpertScheduleRuleDelegate');

class ExpertScheduleExceptionDelegate extends BaseDaoDelegate
{

    getDao():IDao { return new ExpertScheduleExceptionDao();}

    createException(newScheduleException:ExpertScheduleException, transaction?:any):q.Promise<any>
    {
        var self = this;
        // TODO: Handle cyclic dependencies in a better way
        var ExpertScheduleRuleDelegate = require('../delegates/ExpertScheduleRuleDelegate');
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();
        var currentDate = new Date();
        var dateAfterOneYear = new Date();
        dateAfterOneYear.setFullYear(currentDate.getFullYear() + 1);
        var options = { // to validate exception
            startDate: currentDate, // current date
            endDate: dateAfterOneYear // 1 year from current date
        };

        return expertScheduleRuleDelegate.getRulesByIntegrationMemberId(newScheduleException.getIntegrationMemberId(), options.startDate.getTimeInSec(), options.endDate.getTimeInSec())
            .then(
            function createRecord(rawschedules:ExpertScheduleRule[])
            {
                var schedules:ExpertScheduleRule[] = [];
                _.each(rawschedules, function(schedule:any){
                    schedules.push(ExpertScheduleRule.toExpertScheduleRuleObject(schedule));
                });

                options.startDate = new Date (newScheduleException.getStartTime()*1000);
                options.endDate = options.startDate;
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

    validateException(scheduleRules:ExpertScheduleRule[], options, exception:ExpertScheduleException):boolean
    {
        // TODO: Handle cyclic dependencies in a better way
        var ExpertScheduleRuleDelegate = require('../delegates/ExpertScheduleRuleDelegate');
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();
        return expertScheduleRuleDelegate.validateException(scheduleRules, options, exception);

    }

    deleteByRuleId(ruleId:number, transaction?:any):q.Promise<any>
    {
        return this.searchAndDelete({'schedule_rule_id': ruleId},true,transaction);
    }

    deleteByExceptionId(exceptionId:number, transaction?:any):q.Promise<any>
    {
        return this.delete(exceptionId,true,transaction);
    }

    getExceptionsbyId(exceptionId:number):q.Promise<any>
    {
        return this.search({'id': exceptionId});
    }

    getExceptionsByIntegrationMemberId(expertId:number, startTime:number, endTime:number):q.Promise<any>
    {
        return this.getDao().getExceptionByIntegrationMemberId(expertId, startTime, endTime);
    }

    updateException(updatedScheduleRuleException:ExpertScheduleException, transaction?:any):q.Promise<any>
    {
        var self = this;
        // TODO: Handle cyclic dependencies in a better way
        var ExpertScheduleRuleDelegate = require('../delegates/ExpertScheduleRuleDelegate');
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();
        var currentDate = new Date();
        var dateAfterOneYear = new Date();
        dateAfterOneYear.setFullYear(currentDate.getFullYear() + 1);
        var options = {
            startDate: currentDate, // current date
            endDate: dateAfterOneYear // 1 year from current date
        };
        return expertScheduleRuleDelegate.getRulesByIntegrationMemberId(updatedScheduleRuleException.getIntegrationMemberId(), options.startDate.getTime()/1000, options.endDate.getTime()/1000)
            .then(//TODO handle conversion to sec
            function createRecord(rawschedules:ExpertScheduleRule[])
            {
                var schedules:ExpertScheduleRule[] = [];
                _.each(rawschedules, function(schedule:any){
                    schedules.push(ExpertScheduleRule.toExpertScheduleRuleObject(schedule));
                });
                options.startDate = new Date (updatedScheduleRuleException.getStartTime()*1000);
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