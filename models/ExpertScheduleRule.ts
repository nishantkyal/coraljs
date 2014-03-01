///<reference path='../_references.d.ts'/>
import cron                             = require('cron');
import _                                = require('underscore');
import BaseModel                        = require('./BaseModel');
import MoneyUnit                        = require('../enums/MoneyUnit');
import Utils                            = require('../common/Utils')
import ExpertSchedule                   = require('../models/ExpertSchedule');
import ExpertScheduleException          = require('../models/ExpertScheduleException');

class ExpertScheduleRule extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_rule';

    static INTEGRATION_MEMBER_ID:string = 'integration_member_id';
    static REPEAT_START:string = 'repeat_start';
    static CRON_RULE:string = 'cron_rule';
    static REPEAT_END:string = 'repeat_end';
    static DURATION:string = 'duration';
    static PRICE_UNIT:string = 'price_unit';
    static PRICE_PER_MIN:string = 'price_per_min';

    private integration_member_id:number;
    private repeat_start:number;
    private cron_rule:string;
    private repeat_end:number;
    private duration:number;
    private price_unit:MoneyUnit;
    private price_per_min:number;

    /* Getters */
    getIntegrationMemberId():number                         { return this.integration_member_id; }
    getRepeatStart():number                                 { return this.repeat_start; }
    getCronRule():string                                    { return this.cron_rule; }
    getRepeatEnd():number                                   { return this.repeat_end; }
    getDuration():number                                    { return this.duration; }
    getPriceUnit():MoneyUnit                                { return this.price_unit; }
    getPricePerMin():number                                 { return this.price_per_min; }

    /* Setters */
    setIntegrationMemberId(val:number):void                 { this.integration_member_id = val; }
    setRepeatStart(val:number):void                         { this.repeat_start = val; }
    setCronRule(val:string):void                            { this.cron_rule = val; }
    setRepeatEnd(val:number):void                           { this.repeat_end = val; }
    setDuration(val:number):void                            { this.duration = val; }
    setPriceUnit(val:MoneyUnit):void                        { this.price_unit = val; }
    setPricePerMin(val:number):void                         { this.price_per_min = val; }

    isValid():boolean
    {
        var isCronExpressValid:boolean = this.getCronRule().split(' ').length == 6;
        try
        {
            new cron.CronJob(this.getCronRule());
        } catch (e)
        {
            isCronExpressValid = false;
        }

        return !Utils.isNullOrEmpty(this.getRepeatStart())
            && isCronExpressValid
            && !Utils.isNullOrEmpty(this.getDuration())
            && !Utils.isNullOrEmpty(this.getIntegrationMemberId())
            && !Utils.isNullOrEmpty(this.getRepeatEnd())
            && (this.getRepeatEnd() > this.getRepeatStart() || this.getRepeatEnd() == 0);
    }

    conflicts(rule:ExpertScheduleRule, options):boolean
    {
        // TODO: Handle cyclic dependencies in a better way
        var ExpertScheduleRuleDelegate:any = require('../delegates/ExpertScheduleRuleDelegate');
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();

        var existingSchedules:ExpertSchedule[] = expertScheduleRuleDelegate.generateSchedules(rule, null, options);
        var newSchedules:ExpertSchedule[] = expertScheduleRuleDelegate.generateSchedules(this, null, options);

        _.each(existingSchedules, function (es:ExpertSchedule):any {
            _.each(newSchedules, function (ns:ExpertSchedule):any {
                if (es.conflicts(ns))
                    return true;
            });
        });
        return false;
    }

    hasConflicts(rules:ExpertScheduleRule[], options):boolean
    {
        var conflict = false;
        for (var i = 0; i < rules.length; i++)
        {
            conflict = conflict || this.conflicts(rules[i], options);
            if (conflict) break;
        }
        return conflict;
    }

}
export = ExpertScheduleRule