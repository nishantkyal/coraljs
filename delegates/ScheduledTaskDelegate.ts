import q                                                        = require('q');
import _                                                        = require('underscore');
import log4js                                                   = require('log4js');
import moment                                                   = require('moment');
import Utils                                                    = require('../common/Utils');
import Config                                                   = require('../common/Config');
import PhoneCallDelegate                                        = require('../delegates/PhoneCallDelegate');
import SMSDelegate                                              = require('../delegates/SMSDelegate');
import PhoneCall                                                = require('../models/PhoneCall');
import ScheduledTask                                            = require('../models/tasks/ScheduledTask');
import ScheduledTaskType                                        = require('../enums/ScheduledTaskType');
import PhoneCallCache                                           = require('../caches/PhoneCallCache');
import CacheHelper                                              = require('../caches/CacheHelper');

class ScheduledTaskDelegate
{
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private static tasks:{(id:number): ScheduledTask};

    /*getTasks()
    {
        var self = this;
        var currentTime = moment().valueOf();

        return new PhoneCallDelegate().getCallsBetweenInterval(currentTime, currentTime + Config.get('call.schedule.interval') + Config.get('sms.reminder.time'))
            .then(
            function scheduledCalls(calls:PhoneCall[])
            {
                _.each(calls, function (call:PhoneCall)
                {
                    if (call.getStartTime() < currentTime + Config.get('call.schedule.interval')) // to schedule call for next interval
                    {
                        var tempScheduledTask:ScheduledTask = new ScheduledTask();
                        tempScheduledTask.setTask(call);
                        tempScheduledTask.setStartTime(call.getStartTime());
                        tempScheduledTask.setTaskType(ScheduledTaskType.CALL);
                        self.logger.info('Call scheduled. Id:' + call.getId() + ' at' + call.getStartTime());
                        new PhoneCallCache().createPhoneCallCache(call.getId());
                        ScheduledTaskDelegate.tasks.push(tempScheduledTask);
                    }
                    if (call.getStartTime() >= currentTime + Config.get('sms.reminder.time')) //need to schedule reminder SMS as well
                    {
                        var tempSmsScheduledTask:ScheduledTask = new ScheduledTask();
                        tempSmsScheduledTask.setTask(call);
                        tempSmsScheduledTask.setStartTime(call.getStartTime() - Config.get('sms.reminder.time'));
                        tempSmsScheduledTask.setTaskType(ScheduledTaskType.SMS);
                        ScheduledTaskDelegate.tasks.push(tempSmsScheduledTask);
                    }
                })
                return ScheduledTaskDelegate.tasks;
            },
            function fetchError(error)
            {
                self.logger.debug('Error in getting call info for scheduling');
            }
        )
    }*/

    /*executeTask(job:ScheduledTask)
    {
        switch (job.getTaskType())
        {
            case ScheduledTaskType.CALL:
                var call:PhoneCall = job.getTask();
                new PhoneCallDelegate().triggerCall(call.getId());
                break;
            case ScheduledTaskType.SMS:
                var call:PhoneCall = job.getTask();
                new SMSDelegate().sendReminderSMS(call.getId());
                break;
        }
    }*/

    /* Schedule task at specified time */
    scheduleAt(task:ScheduledTask, timestamp:number):number
    {
        var self = this;
        var currentTime = moment().valueOf();
        return self.scheduleAfter(task, (timestamp - currentTime) * 1000);
    }

    /* Schedule task after an interval */
    scheduleAfter(task:ScheduledTask, interval:number):number
    {
        var self = this;
        var taskId:number = setTimeout(task.execute, interval, task);

        task.setStartTime(moment().add({ms: interval}).valueOf());

        // Add task to index and persist
        ScheduledTaskDelegate.tasks[taskId] = task;
        self.syncToRedis();

        return taskId;
    }

    get(taskId:number):ScheduledTask
    {
        return ScheduledTaskDelegate.tasks[taskId];
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
        clearTimeout(taskId);
        delete ScheduledTaskDelegate.tasks[taskId];
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
