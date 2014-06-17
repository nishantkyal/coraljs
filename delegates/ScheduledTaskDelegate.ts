import events                                                   = require('events');
import q                                                        = require('q');
import _                                                        = require('underscore');
import log4js                                                   = require('log4js');
import moment                                                   = require('moment');
import GlobalIdDelegate                                         = require('../delegates/GlobalIDDelegate');
import Utils                                                    = require('../common/Utils');
import Config                                                   = require('../common/Config');
import PhoneCall                                                = require('../models/PhoneCall');
import AbstractScheduledTask                                    = require('../models/tasks/AbstractScheduledTask');
import PhoneCallCache                                           = require('../caches/PhoneCallCache');
import CacheHelper                                              = require('../caches/CacheHelper');
import ScheduledTaskType                                        = require('../enums/ScheduledTaskType');

interface TimeoutAndTask
{
    task:AbstractScheduledTask;
    timeout:any;
}

class ScheduledTaskDelegate extends events.EventEmitter
{
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private static tasks:{[id:number]: TimeoutAndTask} = {};
    private static instance;

    static getInstance():ScheduledTaskDelegate
    {
        if (Utils.isNullOrEmpty(ScheduledTaskDelegate.instance))
            ScheduledTaskDelegate.instance = new ScheduledTaskDelegate();

        return ScheduledTaskDelegate.instance;
    }

    /* Schedule task at specified time */
    scheduleAt(task:AbstractScheduledTask, timestamp:number):q.Promise<number>
    {
        var self = this;
        var currentTime = moment().valueOf();
        task.setStartTime(timestamp);
        return self.scheduleAfter(task, (timestamp - currentTime));
    }

    /* Schedule task after an interval */
    scheduleAfter(task:AbstractScheduledTask, interval:number):q.Promise<number>
    {
        var self = this;
        var taskId:number = new GlobalIdDelegate().generate('ScheduleTask');
        task.setStartTime(moment().add({ms: interval}).valueOf());

        if (!task.isValid())
        {
            this.logger.error('Attempted to schedule invalid task, %s', task);
            return null;
        }

        var timeout:any = setTimeout(function ()
        {
            task.execute()
                .then(function taskExecuted()
                {
                    self.emit('taskCompletedEvent', task.getTaskType())
                })
            self.cancel(task.getId());
        }, interval);

        task.setId(taskId);

        // Add task to index and persist
        ScheduledTaskDelegate.tasks[taskId] = {task: task, timeout: timeout};


        return self.syncToRedis()
            .then(
            function tasksSynced():any
            {
                self.logger.info('Task of type %s scheduled, startTime: %s, id: %s', task.getTaskType(), moment(task.getStartTime()).format('DD/MM/YYYY hh:mm a'), task.getId());
                return taskId;
            },
            function taskSyncFailed()
            {
                self.logger.warn('Task of type %s scheduled, startTime: %s, id: %s', task.getTaskType(), moment(task.getStartTime()).format('DD/MM/YYYY hh:mm a'), task.getId());
                self.cancel(taskId);
            });
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
    find(type:ScheduledTaskType):number
    {
        return _.find(_.keys(ScheduledTaskDelegate.tasks), function (taskId:number)
        {
            var taskAndTimeout:TimeoutAndTask = ScheduledTaskDelegate.tasks[taskId];
            return taskAndTimeout.task.getTaskType() == type;
        });
    }

    filter(type:ScheduledTaskType):AbstractScheduledTask[]
    {
        return _.pluck(_.filter(_.values(ScheduledTaskDelegate.tasks), function (task:TimeoutAndTask)
        {
            return task.task.getTaskType() == type;
        }), 'task');
    }

    /* Return id of all tasks matching search */
    search(criteria:Object):number[]
    {
        return null;
    }

    cancel(taskId:number):q.Promise<any>
    {
        this.logger.info('Task with id - ' + taskId + ' completed');
        clearTimeout(ScheduledTaskDelegate.tasks[taskId].timeout);
        delete ScheduledTaskDelegate.tasks[taskId];
        return this.syncToRedis();
    }

    private syncToRedis():q.Promise<any>
    {
        var self = this;

        var tasks = _.filter(_.values(ScheduledTaskDelegate.tasks), function (timeoutAndTask:TimeoutAndTask)
        {
            return timeoutAndTask.task.getTaskType() != ScheduledTaskType.TIMEZONE_REFRESH
        }); // no need to sync TIMEZONE_REFRESH task to redis as we want to run it every time server starts

        var tasksSaveArray = _.map(tasks, function (timeoutAndTask:TimeoutAndTask)
        {
            return timeoutAndTask.task.toJson();
        });

        return CacheHelper.set('ScheduledTasks', tasksSaveArray, null, true)
            .then(
            function tasksSynced():any
            {
                self.logger.debug("Scheduled tasks synced to Redis");
                return true;
            },
            function tasksSyncError(error)
            {
                self.logger.debug("Error in Syncing Scheduled Tasks to Redis");
                throw(error);
            });
    }

    syncFromRedis():q.Promise<any>
    {
        var self = this;

        return CacheHelper.get('ScheduledTasks')
            .then(
            function tasksFetched(results):any
            {
                return _.map(results, function (result:any)
                {
                    var TaskTypeFactory = require('../factories/TaskTypeFactory');
                    if (result[AbstractScheduledTask.START_TIME] > moment().valueOf())
                        return self.scheduleAt(TaskTypeFactory.getTask(result), result[AbstractScheduledTask.START_TIME]);
                    else
                    {
                        self.logger.error("Task Missed - " + JSON.stringify(result));
                        return self.syncToRedis();
                    }
                });
            },
            function tasksFetchError(error)
            {
                self.logger.error("Error in Syncing Scheduled Tasks From Redis");
                throw(error);
            });
    }

}
export = ScheduledTaskDelegate
