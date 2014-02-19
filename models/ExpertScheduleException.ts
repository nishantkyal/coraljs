/**
 * Created by Ankit on 14/02/14.
 */
import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');

class ExpertScheduleException extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_exceptions';

    integration_member_id:number;
    schedule_rule_id:number;
    start_time:number;
    duration:number;
    private price_unit:MoneyUnit;
    private price_per_min:number;

    /* Getters */
    getIntegrationMemberId():number { return this.integration_member_id; }
    getScheduleRuleId():number { return this.schedule_rule_id; }
    getStartTime():number { return this.start_time; }
    getDuration():number { return this.duration; }
    getPriceUnit():MoneyUnit { return this.price_unit; }
    getPricePerMin():number { return this.price_per_min; }

    /* Setters */
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setScheduleRuleId(val:number):void { this.schedule_rule_id = val; }
    setStartTime(val:number):void { this.start_time = val; }
    setDuration(val:number):void { this.duration = val; }
    setPriceUnit(val:MoneyUnit):void { this.price_unit = val; }
    setPricePerMin(val:number):void { this.price_per_min = val; }
}
export = ExpertScheduleException