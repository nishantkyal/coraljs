/**
 *
 */
class ExpertSchedule
{
    private startTime:number;
    private duration:number;
    private ruleId:number;

    public getRuleId():number       { return this.ruleId; }
    public getStartTime():number    { return this.startTime; }
    public getDuration():number     { return this.duration; }

    public setRuleId(d:number)      { this.ruleId = d; }
    public setStartTime(d:number)        { this.startTime = d; }
    public setDuration(d:number)    { this.duration = d; }
}
export = ExpertSchedule