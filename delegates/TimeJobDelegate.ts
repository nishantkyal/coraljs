import _                                = require('underscore');
import q                                = require('q');
import log4js                           = require('log4js');
import Utils                            = require('../common/Utils');
import Config                           = require('../common/Config');
import SMSDelegate                      = require('../delegates/SMSDelegate');
import PhoneCall                        = require('../models/PhoneCall');
import TimeJob                          = require('../models/TimeJob');
import TimeJobType                      = require('../enums/TimeJobType');
import PhoneCallCache                   = require('../caches/PhoneCallCache');

class TimeJobDelegate
{
    logger:log4js.Logger;
    static jobs:TimeJob[] = [];

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    getJobs():q.Promise<any>
    {
        var self = this;
        var currentTime = new Date().getTimeInSec();
        var PhoneCallDelegate = require('./PhoneCallDelegate');
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
                        self.logger.info('Call scheduled. Id:' + call.getId() + ' at ' + call.getStartTime());
                        new PhoneCallCache().createPhoneCallCache(call.getId());
                        TimeJobDelegate.jobs.push(tempTimeJob);
                    }
                    if(call.getStartTime() >= currentTime + Config.get('sms.reminder.time')) // to schedule reminder SMS as well
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
        var self = this;
        _.each(TimeJobDelegate.jobs, function(job:TimeJob)
        {
            if(job.getJob().getId() == id)
            {
                var foo = setTimeout(function(){ self.executeJob(job) }, duration*1000);
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
                var PhoneCallDelegate = require('./PhoneCallDelegate');
                new PhoneCallDelegate().triggerCall(call.getId());
                clearTimeout(job.getTimeOutReference());
                break;
            case TimeJobType.SMS:
                var call:PhoneCall = job.getJob();
                new SMSDelegate().sendReminderSMS(call.getId());
                clearTimeout(job.getTimeOutReference());
                break;
        }
    }

    getScheduledJobs()
    {
        var self = this;
        var timeLeft:number;
        _.each(TimeJobDelegate.jobs, function(job:TimeJob){
            timeLeft = job.getTimeOutReference()._idleStart + job.getTimeOutReference()._idleTimeout - Date.now()
            self.logger.info("Job scheduled after %s seconds. Job Type is %s ", timeLeft/1000, TimeJobType[job.getJobType()]);
        })
    }
}
export = TimeJobDelegate
