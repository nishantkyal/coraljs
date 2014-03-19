import _                                = require('underscore');
import log4js                           = require('log4js');
import Utils                            = require('../common/Utils');
import Config                           = require('../common/Config');
import PhoneCallDelegate                = require('./PhoneCallDelegate');
import SMSDelegate                      = require('../delegates/SMSDelegate');
import PhoneCall                        = require('../models/PhoneCall');
import ScheduledTask                    = require('../models/ScheduledTask');
import ScheduledTaskType                = require('../enums/ScheduledTaskType');
import PhoneCallCache                   = require('../caches/PhoneCallCache');

class ScheduledTaskDelegate
{
    logger:log4js.Logger;
    static jobs:ScheduledTask[] = [];

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    getTasks()
    {
        var self = this;
        var currentTime = moment().valueOf();

        return new PhoneCallDelegate().getCallsBetweenInterval(currentTime, currentTime + Config.get('call.schedule.interval') + Config.get('sms.reminder.time'))
            .then(
            function scheduledCalls(calls:PhoneCall[])
            {
                _.each(calls,  function (call:PhoneCall){
                    if(call.getStartTime() < currentTime + Config.get('call.schedule.interval')) // to schedule call for next interval
                    {
                        var tempScheduledTask:ScheduledTask = new ScheduledTask();
                        tempScheduledTask.setTask(call);
                        tempScheduledTask.setStartTime(call.getStartTime());
                        tempScheduledTask.setTaskType(ScheduledTaskType.CALL);
                        self.logger.info('Call scheduled. Id:' + call.getId() + ' at' + call.getStartTime());
                        new PhoneCallCache().createPhoneCallCache(call.getId());
                        ScheduledTaskDelegate.jobs.push(tempScheduledTask);
                    }
                    if(call.getStartTime() >= currentTime + Config.get('sms.reminder.time')) //need to schedule reminder SMS as well
                    {
                        var tempSmsScheduledTask:ScheduledTask = new ScheduledTask();
                        tempSmsScheduledTask.setTask(call);
                        tempSmsScheduledTask.setStartTime(call.getStartTime() - Config.get('sms.reminder.time'));
                        tempSmsScheduledTask.setTaskType(ScheduledTaskType.SMS);
                        ScheduledTaskDelegate.jobs.push(tempSmsScheduledTask);
                    }
                })
                return ScheduledTaskDelegate.jobs;
            },
            function fetchError(error)
            {
                self.logger.debug('Error in getting call info for scheduling');
            }
        )
    }

    scheduleTasks()
    {
        var self = this;
        return this.getTasks()
            .then (
            function jobsFetched(jobs)
            {
                var currentTime = moment().valueOf();
                _.each(ScheduledTaskDelegate.jobs, function(job:ScheduledTask)
                {
                    var foo = setTimeout(function(){ self.executeTask(job) },(job.getStartTime()-currentTime)*1000);
                    job.setTimeOutReference(foo);
                })
                return ScheduledTaskDelegate.jobs;
            }
        );
    }

    rescheduleTask(id:number, duration:number)
    {
        //TODO send url accordingly
        var self = this;
        _.each(ScheduledTaskDelegate.jobs, function(job:ScheduledTask)
        {
            if(job.getTask().getId() == id)
            {
                var foo = setTimeout(function(){ self.executeTask(job) },(job.getStartTime() + duration)*1000);
                job.setTimeOutReference(foo);
            }
        })
    }

    cancelTask(id:number)
    {
        _.each(ScheduledTaskDelegate.jobs, function(job:ScheduledTask)
        {
            if(job.getTask().getId() == id)
            {
                clearTimeout(job.getTimeOutReference());
            }
        })
    }

    executeTask(job:ScheduledTask)
    {
        switch(job.getTaskType())
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
    }

    static getScheduledTasks()
    {
        _.each(ScheduledTaskDelegate.jobs, function(job:ScheduledTask){

        })
    }
}
export = ScheduledTaskDelegate
