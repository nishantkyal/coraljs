///<reference path='../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import log4js                                                   = require('log4js');
import moment                                                   = require('moment');
import Utils                                                    = require('../common/Utils');
import Config                                                   = require('../common/Config');
import PhoneCall                                                = require('../models/PhoneCall');
import AbstractScheduledTask                                    = require('../models/tasks/AbstractScheduledTask');
import PhoneCallCache                                           = require('../caches/PhoneCallCache');
import CacheHelper                                              = require('../caches/CacheHelper');
import TaskTypeFactory                                          = require('../factories/TaskTypeFactory');

interface TimeoutAndTask
{
    task:AbstractScheduledTask;
    timeout:any;
}

class ScheduledTaskDelegate
{
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private static tasks:{[id:number]: TimeoutAndTask} = {};

    /* Schedule task at specified time */
    scheduleAt(task:AbstractScheduledTask, timestamp:number):number
    {
        var self = this;
        var currentTime = moment().valueOf();
        task.setStartTime(timestamp);
        return self.scheduleAfter(task, (timestamp - currentTime));
    }

    /* Schedule task after an interval */
    scheduleAfter(task:AbstractScheduledTask, interval:number):number
    {
        var self = this;
        var taskId:number = moment().valueOf();

        if (!task.isValid())
        {
            this.logger.error('Attempted to schedule invalid task, %s', task);
            return null;
        }

        var timeout:any = setTimeout(function ()
        {
            task.execute();
            self.cancel(task.getId());
        }, interval);

        task.setId(taskId);
        task.setStartTime(moment().add({ms: interval}).valueOf());

        // Add task to index and persist
        ScheduledTaskDelegate.tasks[taskId] = {task: task, timeout: timeout};

        // TODO: Make sync to redis work
        self.syncToRedis();

        return taskId;
    }

    getAll():AbstractScheduledTask[]
    {
        return _.values(ScheduledTaskDelegate.tasks);
    }

    get(taskId:number):AbstractScheduledTask
    {
        return ScheduledTaskDelegate.tasks[taskId].task;
    }

    /* Return id of task matching search */
    find(criteria:Object):number
    {
        return null;
    }

    /* Return id of all tasks matching search */
    search(criteria:Object):number[]
    {
        return null;
    }

    cancel(taskId:number):void
    {
        clearTimeout(ScheduledTaskDelegate.tasks[taskId].timeout);
        delete ScheduledTaskDelegate.tasks[taskId];
        this.syncToRedis();
    }

    private syncToRedis():q.Promise<any>
    {
        var self = this;
        var tasksSaveArray = [];
        var tasksKeys =  _.keys(ScheduledTaskDelegate.tasks);
       _.each(tasksKeys, function(key){
            tasksSaveArray.push(ScheduledTaskDelegate.tasks[key].task.toJson());
        });
        return CacheHelper.set('ScheduledTasks', tasksSaveArray, null, true)
            .then(
            function tasksSynced(result)
            {
                self.logger.log("scheduled tasks synced to Redis");
            },
            function tasksSyncError(error)
            {
                self.logger.log("Error in Syncing Scheduled Tasks to Redis");
            });
    }

    syncFromRedis():q.Promise<any>
    {
        var self = this;

        return CacheHelper.get('ScheduledTasks')
            .then(
            function tasksFetched(results)
            {
                _.each(results, function(result:any){
                    if(result[AbstractScheduledTask.STARTTIME] > moment().valueOf())
                        self.scheduleAt(TaskTypeFactory.getTask(result), result[AbstractScheduledTask.STARTTIME]);
                    else
                    {
                        self.logger.error("Task Missed - " + JSON.stringify(result));
                        self.syncToRedis();
                    }
                });

            },
            function tasksFetchError(error)
            {
                self.logger.log("Error in Syncing Scheduled Tasks From Redis");
            });
    }

}
export = ScheduledTaskDelegate
