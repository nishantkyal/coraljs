import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');

class ExpertSchedule extends BaseModel
{
    private startTime:number;
    private duration:number;
    private ruleId:number;

    public getRuleId():number           { return this.ruleId; }
    public getStartTime():number        { return this.startTime; }
    public getDuration():number         { return this.duration; }

    public setRuleId(val:number)        { this.ruleId = val; }
    public setStartTime(val:number)     { this.startTime = val; }
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