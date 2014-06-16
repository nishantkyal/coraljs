import BaseModel                                            = require('./BaseModel');
import MoneyUnit                                            = require('../enums/MoneyUnit');

class ExpertSchedule extends BaseModel
{
    public static START_TIME:string                         = 'start_time';
    public static DURATION:string                           = 'duration';
    public static PRICE_PER_MIN:string                      = 'price_per_min';
    public static PRICE_UNIT:string                         = 'price_unit';
    public static PRICING_SCHEME_ID:string                  = 'pricing_scheme_id';

    private start_time:number;
    private duration:number;
    private schedule_rule_id:number;
    private pricing_scheme_id:number;

    /* Getters */
    getScheduleRuleId():number                              { return this.schedule_rule_id; }
    getStartTime():number                                   { return this.start_time; }
    getDuration():number                                    { return this.duration; }
    getPricingSchemeId():number                             { return this.pricing_scheme_id; }

    /* Setters */
    setScheduleRuleId(val:number)                           { this.schedule_rule_id = val; }
    setStartTime(val:number)                                { this.start_time = val; }
    setDuration(val:number)                                 { this.duration = val; }
    setPricingSchemeId(val:number)                          { this.pricing_scheme_id = val; }

    conflicts(schedule:ExpertSchedule):boolean
    {
        var newScheduleStartTime = schedule.getStartTime();
        var newScheduleEndTime = schedule.getStartTime() + schedule.getDuration();

        var existingScheduleStartTime = this.getStartTime();
        var existingScheduleEndTime = this.getStartTime() + this.getDuration();

        return !(newScheduleStartTime > existingScheduleEndTime || newScheduleEndTime < existingScheduleStartTime);
    }
}
export = ExpertSchedule