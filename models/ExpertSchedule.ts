import BaseModel            = require('../models/BaseModel');
import MoneyUnit            = require('../enums/MoneyUnit');

class ExpertSchedule extends BaseModel
{
    static TABLE_NAME:string = 'expert_schedule';

    private schedule_rule_id:number;
    private integration_member_id:number;
    private start_time:number;
    private duration:number;
    private price_unit:MoneyUnit;
    private price_per_min:number;
    private active:boolean;

    /* Getters */
    getScheduleRuleId():number { return this.schedule_rule_id; }
    getIntegrationMemberId():number { return this.integration_member_id; }
    getStartTime():number { return this.start_time; }
    getDuration():number { return this.duration; }
    getPriceUnit():MoneyUnit { return this.price_unit; }
    getPricePerMin():number { return this.price_per_min; }
    getActive():boolean { return this.active; }

    /* Setters */
    setScheduleRuleId(val:number):void { this.schedule_rule_id = val; }
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setStartTime(val:number):void { this.start_time = val; }
    setDuration(val:number):void { this.duration = val; }
    setPriceUnit(val:MoneyUnit):void { this.price_unit = val; }
    setPricePerMin(val:number):void { this.price_per_min = val; }
    setActive(val:boolean):void { this.active = val; }

}
export = ExpertSchedule