///<reference path='../../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import moment                                                   = require('moment');
import log4js                                                   = require('log4js');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import CustomPromiseScheduledTask                               = require('./CustomPromiseScheduledTask');
import ScheduledTaskDelegate                                    = require('../../delegates/ScheduledTaskDelegate');
import PhoneCallDelegate                                        = require('../../delegates/PhoneCallDelegate');
import NotificationDelegate                                     = require('../../delegates/NotificationDelegate');
import TriggerPhoneCallTask                                     = require('./TriggerPhoneCallTask');
import PhoneCall                                                = require('../../models/PhoneCall');
import Config                                                   = require('../../common/Config');
import Utils                                                    = require('../../common/Utils');
import PhoneCallCache                                           = require('../../caches/PhoneCallCache');

class ScheduleCallsScheduledTask extends AbstractScheduledTask
{
    execute():q.Promise<any>
    {
        var scheduledTaskDelegate = new ScheduledTaskDelegate();
        var phoneCallDelegate = new PhoneCallDelegate();
        var phoneCallCache = new PhoneCallCache();
        var self = this;

        // Add tasks for
        // 1. Triggering call
        // 2. Sending reminder notifications
        // Also add calls to cache for faster access by twilio API calls
        return phoneCallDelegate.getCallsBetweenInterval(moment().valueOf(), moment().add({minutes: parseInt(Config.get(Config.PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS))}).valueOf())
            .then(
            function callsFetched(calls:PhoneCall[]):any
            {
                return q.all(_.map(calls, function (call:PhoneCall)
                {
                    phoneCallDelegate.scheduleCall(call);

                    return phoneCallCache.addCall(call);
                }));
            },
            function callsFetchError(error)
            {
                self.logger.fatal('An error occurred while scheduling calls. Error: %s', error);
            })
            .finally(
            function triggerAfterOneHour()
            {
                var millis:number = parseInt(Config.get(Config.PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS)) * 1000;
                scheduledTaskDelegate.scheduleAfter(new ScheduleCallsScheduledTask(), millis);
            });
    }

    isValid():boolean
    {
        return super.isValid();
    }
}
export = ScheduleCallsScheduledTask