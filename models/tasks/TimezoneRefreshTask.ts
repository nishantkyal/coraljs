///<reference path='../../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import moment                                                   = require('moment');
import log4js                                                   = require('log4js');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import TimezoneDelegate                                         = require('../../delegates/TimezoneDelegate');
import ScheduledTaskDelegate                                    = require('../../delegates/ScheduledTaskDelegate');
import Config                                                   = require('../../common/Config');
import Utils                                                    = require('../../common/Utils');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');

class TimezoneRefreshTask extends AbstractScheduledTask
{
    timezoneDelegate = new TimezoneDelegate();
    scheduledTaskDelegate = new ScheduledTaskDelegate();

    constructor()
    {
        super();
        this.setTaskType(ScheduledTaskType.TIMEZONE_REFRESH);
    }

    execute():q.Promise<any>
    {
        var self = this;

        return this.timezoneDelegate.getCurrentOffsets()
            .finally( function triggerAfterOneDay(){
                var millis:number = parseInt(Config.get(Config.TIMEZONE_REFRESH_INTERVAL_SECS)) * 1000;
                self.scheduledTaskDelegate.scheduleAfter(new TimezoneRefreshTask(), millis);
            })
    }

    isValid():boolean
    {
        return super.isValid();
    }
}
export = TimezoneRefreshTask