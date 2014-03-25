///<reference path='../../_references.d.ts'/>
import q                                        = require('q');
import ScheduledTaskType                        = require('../../enums/ScheduledTaskType');
import Utils                                    = require('../../common/Utils');
class ScheduledTask
{
    private function:Function;
    private args:any[];
    private startTime:number;
    private taskType:ScheduledTaskType;

    getFunction():Function                              { return this.function; }
    getArgs():any[]                                     { return this.args; }
    getStartTime():number                               { return this.startTime; }
    getTaskType():ScheduledTaskType                     { return this.taskType; }

    setFunction(val:Function)                           { this.function = val; }
    setArgs(val:any[])                                  { this.args = val; }
    setStartTime(val:number)                            { this.startTime = val; }
    setTaskType(val:ScheduledTaskType)                  { this.taskType = val; }

    execute()
    {
        this.getFunction().call(this, this.getArgs());
    }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getTaskType())
                    && !Utils.isNullOrEmpty(this.getStartTime())
                        && !Utils.isNullOrEmpty(this.getFunction());
    }
}
export = ScheduledTask