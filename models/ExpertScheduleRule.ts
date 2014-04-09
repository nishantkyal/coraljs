///<reference path='../_references.d.ts'/>
import q                                = require('q');
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
    static TITLE:string = 'title';
    static REPEAT_START:string = 'repeat_start';
    static CRON_RULE:string = 'cron_rule';
    static REPEAT_END:string = 'repeat_end';
    static DURATION:string = 'duration';
    static PRICE_UNIT:string = 'price_unit';
    static PRICE_PER_MIN:string = 'price_per_min';

    private integration_member_id:number;
    private title:string;
    private repeat_start:number;
    private cron_rule:string;
    private repeat_end:number;
    private duration:number;
    private price_unit:MoneyUnit;
    private price_per_min:number;

    /* Getters */
    getIntegrationMemberId():number { return this.integration_member_id; }
    getTitle():string { return this.title; }
    getRepeatStart():number { return this.repeat_start; }
    getCronRule():string { return this.cron_rule; }
    getRepeatEnd():number { return this.repeat_end; }
    getDuration():number { return this.duration; }
    getPriceUnit():MoneyUnit { return this.price_unit; }
    getPricePerMin():number { return this.price_per_min; }

    /* Setters */
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setTitle(val:string):void { this.title = val; }
    setRepeatStart(val:number):void { this.repeat_start = val; }
    setCronRule(val:string):void { this.cron_rule = val; }
    setRepeatEnd(val:number):void { this.repeat_end = val; }
    setDuration(val:number):void { this.duration = val; }
    setPriceUnit(val:MoneyUnit):void { this.price_unit = val; }
    setPricePerMin(val:number):void { this.price_per_min = val; }

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

    conflicts(rule:ExpertScheduleRule, options):q.Promise<any>
    {
        return this.checkForConflicts(rule, options)
            .fail(
            function conflictFound()
            {
                return true;
            });
    }

    hasConflicts(rules:ExpertScheduleRule[], options):q.Promise<any>
    {
        var self = this;

        return q.all(_.map(rules, function (rule)
            {
                return self.checkForConflicts(rule, options);
            }))
            .then(
            function conflictsChecked(result) {
                return false;
            },
            function conflictFound()
            {
                return true;
            });
    }

    private checkForConflicts(rule:ExpertScheduleRule, options):q.Promise<any>
    {
        // TODO: Handle cyclic dependencies in a better way
        var ExpertScheduleDelegate = require('../delegates/ExpertScheduleDelegate');
        var expertScheduleDelegate:any = new ExpertScheduleDelegate();

        return q.all([
                expertScheduleDelegate.getSchedulesForRule(rule, options.startDate, options.endDate),
                expertScheduleDelegate.getSchedulesForRule(this, options.startDate, options.endDate)
            ])
            .then(
            function schedulesGenerated(...args)
            {
                var existingSchedules:ExpertSchedule[] = args[0][0];
                var newSchedules:ExpertSchedule[] = args[0][1];

                _.each(existingSchedules, function (es:ExpertSchedule)
                {
                    _.each(newSchedules, function (ns:ExpertSchedule)
                    {
                        if (es.conflicts(ns))
                            throw('Conflicting schedule found');
                    });
                });
                return false;
            });
    }

}
export = ExpertScheduleRule