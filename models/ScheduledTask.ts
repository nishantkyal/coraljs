///<reference path='../_references.d.ts'/>
import q                                        = require('q');
import ScheduledTaskType                        = require('../enums/ScheduledTaskType');

class ScheduledTask
{
    private task:any;
    private startTime:number;
    private taskType:ScheduledTaskType;
    private timeOutReference:any;

    getTask():any                                       { return this.task; }
    getStartTime():number                               { return this.startTime; }
    getTaskType():ScheduledTaskType                     { return this.taskType; }
    getTimeOutReference():any                           { return this.timeOutReference; }

    setTask(val:any)                                    { this.task = val; }
    setStartTime(val:number)                            { this.startTime = val; }
    setTaskType(val:ScheduledTaskType)                  { this.taskType = val; }
    setTimeOutReference(val:any)                        { this.timeOutReference = val; }

}
export = ScheduledTask