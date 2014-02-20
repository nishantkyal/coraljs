import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');

class ExpertScheduleRule extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_rules';

    static INTEGRATION_MEMBER_ID:string = 'integration_member_id';
    static REPEAT_START:string = 'repeat_start';
    static REPEAT_INTERVAL:string = 'repeat_interval';
    static REPEAT_CRON:string = 'repeat_cron';
    static REPEAT_END:string = 'repeat_end';
    static DURATION:string = 'duration';
    static PRICE_UNIT:string = 'price_unit';
    static PRICE_PER_MIN:string = 'price_per_min';

    private integration_member_id:number;
    private repeat_start:number;
    private repeat_interval:number;
    private repeat_cron:number;
    private repeat_end:number;
    private duration:number;
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