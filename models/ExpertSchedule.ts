import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');

class ExpertSchedule extends BaseModel
{
    private start_time:number;
    private duration:number;
    private schedule_rule_id:number;

    public getScheduleRuleId():number           { return this.schedule_rule_id; }
    public getStartTime():number        { return this.start_time; }
    public getDuration():number         { return this.duration; }

    public setScheduleRuleId(val:number)        { this.schedule_rule_id = val; }
    public setStartTime(val:number)     { this.start_time = val; }
    public setDuration(val:number)      { this.duration = val; }

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