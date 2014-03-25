///<reference path='../_references.d.ts'/>
import _                                                        = require('underscore');
import log4js                                                   = require('log4js');
import moment                                                   = require('moment');
import Utils                                                    = require('../common/Utils');
import Config                                                   = require('../common/Config');
import PhoneCallDelegate                                        = require('./PhoneCallDelegate');
import SMSDelegate                                              = require('../delegates/SMSDelegate');
import PhoneCall                                                = require('../models/PhoneCall');
import TimeJob                                                  = require('../models/TimeJob');
import TimeJobType                                              = require('../enums/TimeJobType');
import PhoneCallCache                                           = require('../caches/PhoneCallCache');

class TimeJobDelegate
{
    logger:log4js.Logger;
    static jobs:TimeJob[] = [];

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    getJobs()
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
                        var tempTimeJob:TimeJob = new TimeJob();
                        tempTimeJob.setJob(call);
                        tempTimeJob.setStartTime(call.getStartTime());
                        tempTimeJob.setJobType(TimeJobType.CALL);
                        self.logger.info('Call scheduled. Id:' + call.getId() + ' at' + call.getStartTime());
                        new PhoneCallCache().createPhoneCallCache(call.getId());
                        TimeJobDelegate.jobs.push(tempTimeJob);
                    }
                    if(call.getStartTime() >= currentTime + Config.get('sms.reminder.time')) //need to schedule reminder SMS as well
                    {
                        var tempSmsTimeJob:TimeJob = new TimeJob();
                        tempSmsTimeJob.setJob(call);
                        tempSmsTimeJob.setStartTime(call.getStartTime() - Config.get('sms.reminder.time'));
                        tempSmsTimeJob.setJobType(TimeJobType.SMS);
                        TimeJobDelegate.jobs.push(tempSmsTimeJob);
                    }
                })
                return TimeJobDelegate.jobs;
            },
            function fetchError(error)
            {
                self.logger.debug('Error in getting call info for scheduling');
            }
        )
    }

    scheduleJobs()
    {
        var self = this;
        return this.getJobs()
            .then (
            function jobsFetched(jobs)
            {
                var currentTime = new Date().getTimeInSec();
                _.each(TimeJobDelegate.jobs, function(job:TimeJob)
                {
                    var foo = setTimeout(function(){ self.executeJob(job) },(job.getStartTime()-currentTime)*1000);
                    job.setTimeOutReference(foo);
                })
                return TimeJobDelegate.jobs;
            }
        );
    }

    rescheduleJob(id:number, duration:number)
    {
        //TODO send url accordingly
        var self = this;
        _.each(TimeJobDelegate.jobs, function(job:TimeJob)
        {
            if(job.getJob().getId() == id)
            {
                var foo = setTimeout(function(){ self.executeJob(job) },(job.getStartTime() + duration)*1000);
                job.setTimeOutReference(foo);
            }
        })
    }

    cancelJob(id:number)
    {
        var self = this;
        _.each(TimeJobDelegate.jobs, function(job:TimeJob)
        {
            if(job.getJob().getId() == id)
            {
                clearTimeout(job.getTimeOutReference());
            }
        })
    }

    executeJob(job:TimeJob)
    {
        switch(job.getJobType())
        {
            case TimeJobType.CALL:
                var call:PhoneCall = job.getJob();
                new PhoneCallDelegate().triggerCall(call.getId());
                break;
            case TimeJobType.SMS:
                var call:PhoneCall = job.getJob();
                new SMSDelegate().sendReminderSMS(call.getId());
                break;
        }
    }

    static getScheduledJobs()
    {
        _.each(TimeJobDelegate.jobs, function(job:TimeJob){

        })
    }
}
export = TimeJobDelegate
