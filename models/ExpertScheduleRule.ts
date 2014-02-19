import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');

class ExpertScheduleRule extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_rules';

    integration_member_id:number;
    repeat_start:number;
    cron_rule:string;
    repeat_end:number;
    duration:number;
    private price_unit:MoneyUnit;
    private price_per_min:number;

    /* Getters */
    getRuleId():number {return this.getId();}
    getIntegrationMemberId():number { return this.integration_member_id; }
    getRepeatStart():number { return this.repeat_start; }
    getCronRule():string { return this.cron_rule; }
    getRepeatEnd():number { return this.repeat_end; }
    getDuration():number { return this.duration; }
    getPriceUnit():MoneyUnit { return this.price_unit; }
    getPricePerMin():number { return this.price_per_min; }


    /* Setters */
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setRepeatStart(val:number):void { this.repeat_start = val; }
    setCronRule(val:string):void { this.cron_rule = val; }
    setRepeatEnd(val:number):void { this.repeat_end = val; }
    setDuration(val:number):void { this.duration = val; }
    setPriceUnit(val:MoneyUnit):void { this.price_unit = val; }
    setPricePerMin(val:number):void { this.price_per_min = val; }

    isValid():boolean {
        return this.getRepeatStart() != null
                   && (this.getCronRule() != null)
                        && this.getDuration() != null
                            && this.getIntegrationMemberId() != null;
    }
}
export = ExpertScheduleRule