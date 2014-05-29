///<reference path='../../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import moment                                                   = require('moment');
import log4js                                                   = require('log4js');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import ScheduledTaskDelegate                                    = require('../../delegates/ScheduledTaskDelegate');
import PhoneCallDelegate                                        = require('../../delegates/PhoneCallDelegate');
import NotificationDelegate                                     = require('../../delegates/NotificationDelegate');
import TriggerPhoneCallTask                                     = require('./TriggerPhoneCallTask');
import PhoneCall                                                = require('../../models/PhoneCall');
import Config                                                   = require('../../common/Config');
import Utils                                                    = require('../../common/Utils');
import PhoneCallCache                                           = require('../../caches/PhoneCallCache');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');
import IncludeFlag                                              = require('../../enums/IncludeFlag');

class ScheduleCallsScheduledTask extends AbstractScheduledTask
{
    private phoneCallDelegate = new PhoneCallDelegate();

    constructor()
    {
        super();
        this.setTaskType(ScheduledTaskType.CALL_SCHEDULE);
    }

    execute():q.Promise<any>
    {
        var self = this;
        var scheduledTaskDelegate = new ScheduledTaskDelegate();
        var phoneCallCache = new PhoneCallCache();
        var notificationDelegate = new NotificationDelegate();

        // Add tasks for
        // 1. Triggering call
        // 2. Sending reminder notifications
        // Also add calls to cache for faster access by twilio API calls
        var callIntervalStartTime = moment().valueOf();
        var callIntervalEndTime = moment().add({minutes: parseInt(Config.get(Config.PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS))}).valueOf();
        var query:Object = {
            'start_time': {
                'operator': 'between',
                'value': [callIntervalStartTime, callIntervalEndTime]
            }
        };

        return self.phoneCallDelegate.search(query, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER])
            .then(
            function callsFetched(calls:PhoneCall[]):any
            {
                return q.all(_.map(calls, function (call:PhoneCall)
                {
                    self.phoneCallDelegate.queueCallForTriggering(call);
                    notificationDelegate.scheduleCallNotification(call);
                    return phoneCallCache.addCall(call);
                }));
            },
            function callsFetchError(error)
            {
                self.logger.fatal('An error occurred while scheduling calls. Error: %s', JSON.stringify(error));
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