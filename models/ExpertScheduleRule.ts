///<reference path='../_references.d.ts'/>
import q                                                        = require('q');
import cron                                                     = require('cron');
import _                                                        = require('underscore');
import BaseModel                                                = require('./BaseModel');
import MoneyUnit                                                = require('../enums/MoneyUnit');
import DayName                                                  = require('../enums/DayName');
import Utils                                                    = require('../common/Utils')
import ExpertSchedule                                           = require('../models/ExpertSchedule');
import ExpertScheduleException                                  = require('../models/ExpertScheduleException');
import PricingScheme                                            = require('../models/PricingScheme');
import CronRule                                                 = require('../models/CronRule');

class ExpertScheduleRule extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_rule';

    static USER_ID:string                                       = 'user_id';
    static TITLE:string                                         = 'title';
    static REPEAT_START:string                                  = 'repeat_start';
    static CRON_RULE:string                                     = 'cron_rule';
    static REPEAT_END:string                                    = 'repeat_end';
    static DURATION:string                                      = 'duration';
    static PRICING_SCHEME_ID:string                             = 'pricing_scheme_id';

    static DEFAULT_FIELDS:string[] = [ExpertScheduleRule.USER_ID, ExpertScheduleRule.TITLE, ExpertScheduleRule.REPEAT_END, ExpertScheduleRule.REPEAT_START,
        ExpertScheduleRule.CRON_RULE, ExpertScheduleRule.DURATION, ExpertScheduleRule.PRICING_SCHEME_ID];

    private user_id:number;
    private title:string;
    private repeat_start:number;
    private cron_rule:string;
    private repeat_end:number;
    private duration:number;
    private pricing_scheme_id:number;

    /* Getters */
    getUserId():number                                          { return this.user_id; }
    getTitle():string                                           { return this.title; }
    getRepeatStart():number                                     { return this.repeat_start; }
    getCronRule():string                                        { return this.cron_rule; }
    getRepeatEnd():number                                       { return this.repeat_end; }
    getDuration():number                                        { return this.duration; }
    getPricingSchemeId():number                                 { return this.pricing_scheme_id; }

    /* Setters */
    setUserId(val:number):void                                  { this.user_id = val; }
    setTitle(val:string):void                                   { this.title = val; }
    setRepeatStart(val:number):void                             { this.repeat_start = val; }
    setCronRule(val:string):void                                { this.cron_rule = val; }
    setRepeatEnd(val:number):void                               { this.repeat_end = val; }
    setDuration(val:number):void                                { this.duration = val; }
    setPricingSchemeId(val:number):void                         { this.pricing_scheme_id = val; }

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
            && !Utils.isNullOrEmpty(this.getUserId())
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