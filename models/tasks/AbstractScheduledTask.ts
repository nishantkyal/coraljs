///<reference path='../../_references.d.ts'/>
import q                                        = require('q');
import log4js                                   = require('log4js');
import ScheduledTaskType                        = require('../../enums/ScheduledTaskType');
import Utils                                    = require('../../common/Utils');

class AbstractScheduledTask
{
    static ID:string = 'id';
    static START_TIME:string = 'startTime';
    static TASKTYPE:string = 'taskType';

    private id:number;
    private startTime:number;
    private taskType:ScheduledTaskType;
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    getId():number                                      { return this.id; }
    getStartTime():number                               { return this.startTime; }
    getTaskType():ScheduledTaskType                     { return this.taskType; }

    setId(val:number)                                   { this.id = val; }
    setStartTime(val:number)                            { this.startTime = val; }
    setTaskType(val:ScheduledTaskType)                  { this.taskType = val; }

    execute():q.Promise<any>
    {
        throw new Error('Implement this method');
        return q.reject('Implement this method');
    }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getTaskType())
                    && !Utils.isNullOrEmpty(this.getStartTime());
    }

    toJson():Object
    {
        return {id:this.id, taskType:this.taskType, startTime:this.startTime}
    }
}
export = AbstractScheduledTask