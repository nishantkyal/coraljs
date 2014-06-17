///<reference path='../../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import moment                                                   = require('moment');
import log4js                                                   = require('log4js');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import TimezoneDelegate                                         = require('../../delegates/TimezoneDelegate');
import Config                                                   = require('../../common/Config');
import Utils                                                    = require('../../common/Utils');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');

class TimezoneRefreshTask extends AbstractScheduledTask
{
    private timezoneDelegate = new TimezoneDelegate();
    private scheduledTaskDelegate;

    constructor()
    {
        super();

        var ScheduledTaskDelegate = require('../../delegates/ScheduledTaskDelegate');
        this.scheduledTaskDelegate = ScheduledTaskDelegate.getInstance();

        this.setTaskType(ScheduledTaskType.TIMEZONE_REFRESH);
    }

    execute():q.Promise<any>
    {
        var self = this;

        return this.timezoneDelegate.updateTimezoneCache()
            .finally(
            function triggerAfterOneDay()
            {
                var millis:number = parseInt(Config.get(Config.TIMEZONE_REFRESH_INTERVAL_SECS)) * 1000;
                return self.scheduledTaskDelegate.scheduleAfter(new TimezoneRefreshTask(), millis);
            });
    }

    isValid():boolean
    {
        return super.isValid();
    }
}
export = TimezoneRefreshTask