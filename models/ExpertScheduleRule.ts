import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');

class ExpertScheduleRule extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_rules';

    integration_member_id:number;
    repeat_start:number;
    repeat_interval:number;
    repeat_cron:number;
    repeat_end:number;
    duration:number;
    private price_unit:MoneyUnit;
    private price_per_min:number;

    /* Getters */
    getIntegrationMemberId():number { return this.integration_member_id; }
    getRepeatStart():number { return this.repeat_start; }
    getRepeatInterval():number { return this.repeat_interval; }
    getRepeatCron():number { return this.repeat_cron; }
    getRepeatEnd():number { return this.repeat_end; }
    getDuration():number { return this.duration; }
    getPriceUnit():MoneyUnit { return this.price_unit; }
    getPricePerMin():number { return this.price_per_min; }

    /* Setters */
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setRepeatStart(val:number):void { this.repeat_start = val; }
    setRepeatInterval(val:number):void { this.repeat_interval = val; }
    setRepeatCron(val:number):void { this.repeat_cron = val; }
    setRepeatEnd(val:number):void { this.repeat_end = val; }
    setDuration(val:number):void { this.duration = val; }
    setPriceUnit(val:MoneyUnit):void { this.price_unit = val; }
    setPricePerMin(val:number):void { this.price_per_min = val; }

    isValid():boolean {
        return this.getRepeatStart() != null
                   && (this.getRepeatCron() != null || this.getRepeatInterval() != null)
                        && this.getDuration() != null
                            && this.getIntegrationMemberId() != null;
    }
}
export = ExpertScheduleRule