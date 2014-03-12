import TimeJobType           = require('../enums/TimeJobType');
class TimeJob
{
    private job:any;
    private startTime:number;
    private jobType:TimeJobType;
    private timeOutReference:any;

    getJob():any                { return this.job; }
    getStartTime():number       { return this.startTime; }
    getJobType():TimeJobType    { return this.jobType; }
    getTimeOutReference():any   { return this.timeOutReference; }

    setJob(obj:any)             { this.job = obj; }
    setStartTime(time:number)   { this.startTime = time; }
    setJobType(type:TimeJobType){ this.jobType = type; }
    setTimeOutReference(t:any)  { this.timeOutReference = t; }
}
export = TimeJob