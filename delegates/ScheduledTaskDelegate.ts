///<reference path='../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import log4js                                                   = require('log4js');
import moment                                                   = require('moment');
import Utils                                                    = require('../common/Utils');
import Config                                                   = require('../common/Config');
import PhoneCallDelegate                                        = require('../delegates/PhoneCallDelegate');
import SMSDelegate                                              = require('../delegates/SMSDelegate');
import PhoneCall                                                = require('../models/PhoneCall');
import AbstractScheduledTask                                    = require('../models/tasks/AbstractScheduledTask');
import ScheduledTaskType                                        = require('../enums/ScheduledTaskType');
import PhoneCallCache                                           = require('../caches/PhoneCallCache');
import CacheHelper                                              = require('../caches/CacheHelper');

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
        return self.scheduleAfter(task, (timestamp - currentTime) * 1000);
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
        //self.syncToRedis();

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
        return CacheHelper.set('ScheduledTasks', ScheduledTaskDelegate.tasks)
            .then(
            function tasksSynced(result)
            {

            },
            function tasksSyncError(error)
            {

            });
    }

    private syncFromRedis():q.Promise<any>
    {
        return CacheHelper.get('ScheduledTasks')
            .then(
            function tasksFetched(result)
            {

            },
            function tasksFetchError(error)
            {

            });
    }

}
export = ScheduledTaskDelegate
