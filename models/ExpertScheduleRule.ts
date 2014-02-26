import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');
import Utils                    = require('../common/Utils')

class ExpertScheduleRule extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_rule';

    private integration_member_id:number;
    private repeat_start:number;
    private cron_rule:string;
    private repeat_end:number;
    private duration:number;
    private price_unit:MoneyUnit;
    private price_per_min:number;

    /* Getters */
    getRuleId():number                  { return this.getId(); }
    getIntegrationMemberId():number     { return this.integration_member_id; }
    getRepeatStart():number             { return this.repeat_start; }
    getCronRule():string                { return this.cron_rule; }
    getRepeatEnd():number               { return this.repeat_end; }
    getDuration():number                { return this.duration; }
    getPriceUnit():MoneyUnit            { return this.price_unit; }
    getPricePerMin():number             { return this.price_per_min; }


    /* Setters */
    setIntegrationMemberId(val:number):void     { this.integration_member_id = val; }
    setRepeatStart(val:number):void             { this.repeat_start = val; }
    setCronRule(val:string):void                { this.cron_rule = val; }
    setRepeatEnd(val:number):void               { this.repeat_end = val; }
    setDuration(val:number):void                { this.duration = val; }
    setPriceUnit(val:MoneyUnit):void            { this.price_unit = val; }
    setPricePerMin(val:number):void             { this.price_per_min = val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getRepeatStart())
            && !Utils.isNullOrEmpty(this.getCronRule())
            && !Utils.isNullOrEmpty(this.getDuration())
            && !Utils.isNullOrEmpty(this.getIntegrationMemberId())
            && !Utils.isNullOrEmpty(this.getRepeatEnd())
            && (this.getRepeatEnd()>this.getRepeatStart());
    }

    static toExpertScheduleRuleObject(schedule:any):ExpertScheduleRule
    {
        var tempScheduleRule:ExpertScheduleRule = new ExpertScheduleRule();
        tempScheduleRule.setCronRule(schedule['cron_rule']);
        tempScheduleRule.setDuration(schedule['duration']);
        tempScheduleRule.setIntegrationMemberId(schedule['integration_member_id']);
        tempScheduleRule.setPricePerMin(schedule['price_per_min']);
        tempScheduleRule.setPriceUnit(schedule['price_unit']);
        tempScheduleRule.setRepeatEnd(schedule['repeat_end']);
        tempScheduleRule.setRepeatStart(schedule['repeat_start']);
        tempScheduleRule.setId(schedule['id']);
        return tempScheduleRule;
    }
}
export = ExpertScheduleRule