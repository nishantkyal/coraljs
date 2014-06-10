import BaseModel                                            = require('./BaseModel');
import MoneyUnit                                            = require('../enums/MoneyUnit');

class ExpertSchedule extends BaseModel
{
    public static START_TIME:string                         = 'start_time';
    public static DURATION:string                           = 'duration';
    public static PRICE_PER_MIN:string                      = 'price_per_min';
    public static PRICE_UNIT:string                         = 'price_unit';
    public static MIN_DURATION:string                       = 'min_duration';

    private start_time:number;
    private duration:number;
    private schedule_rule_id:number;
    private price_per_min:number;
    private price_unit:MoneyUnit;
    private min_duration:number;

    /* Getters */
    getScheduleRuleId():number                              { return this.schedule_rule_id; }
    getStartTime():number                                   { return this.start_time; }
    getDuration():number                                    { return this.duration; }
    getPricePerMin():number                                 { return this.price_per_min; }
    getPriceUnit():MoneyUnit                                { return this.price_unit; }
    getMinDuration():number                                 { return this.min_duration; }

    /* Setters */
    setScheduleRuleId(val:number)                           { this.schedule_rule_id = val; }
    setStartTime(val:number)                                { this.start_time = val; }
    setDuration(val:number)                                 { this.duration = val; }
    setPricePerMin(val:number):void                         { this.price_per_min = val; }
    setPriceUnit(val:MoneyUnit):void                        { this.price_unit = val; }
    setMinDuration(val:number):void                         { this.min_duration= val; }

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