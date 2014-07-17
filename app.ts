///<reference path='./_references.d.ts'/>
import _                                            = require('underscore');
import q                                            = require('q');
import express                                      = require('express');
import connect_flash                                = require("connect-flash");
import https                                        = require('https');
import log4js                                       = require('log4js');
import moment                                       = require('moment');
import fs                                           = require('fs');
import path                                         = require('path');
import appInit                                      = require('./appInit');
import ScheduleCallsScheduledTask                   = require('./models/tasks/ScheduleCallsScheduledTask');
import TimezoneRefreshTask                          = require('./models/tasks/TimezoneRefreshTask');
import Config                                       = require('./common/Config');
import Credentials                                  = require('./common/Credentials');
import Formatter                                    = require('./common/Formatter');
import Utils                                        = require('./common/Utils');
import ScheduledTaskType                            = require('./enums/ScheduledTaskType');
import ApiUrlDelegate                               = require('./delegates/ApiUrlDelegate');
import IntegrationDelegate                          = require('./delegates/IntegrationDelegate');
import ScheduledTaskDelegate                        = require('./delegates/ScheduledTaskDelegate');
import TimezoneDelegate                             = require('./delegates/TimezoneDelegate');
import RequestHandler                               = require('./middleware/RequestHandler');
var connect                                         = require('connect');
var pjson                                           = require('./package.json');

log4js.configure('/var/searchntalk/config/log4js.json');
Config.set(Config.VERSION, pjson['version']);

/* Underscore settings and helpers */
_.templateSettings = {
    evaluate: /\{\[([\s\S]+?)\]\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g
};

_.mixin(appInit.helpers);
_.extend(_, appInit.helpers);

if (Config.get(Config.ENABLE_HTTP))
{
    var app:express.Application = express();
    appInit.initialise(app);

    app.set('port', Config.get(Config.DASHBOARD_HTTP_PORT));
    app.listen(app.get('port'), serverStartupAction);

    log4js.getDefaultLogger().debug("SearchNTalk started on port %d in %s mode", app.get('port'), app.settings.env);
}

if (Config.get(Config.ENABLE_HTTPS))
{
    var secureApp = express();
    appInit.initialise(secureApp);

    var credentials = {
        key: fs.readFileSync(path.join(__dirname, Config.get(Config.SSL_KEY))),
        cert: fs.readFileSync(path.join(__dirname, Config.get(Config.SSL_CERT)))
    };

    https.createServer(credentials, secureApp).listen(Config.get(Config.DASHBOARD_HTTPS_PORT), serverStartupAction);

    log4js.getDefaultLogger().debug("SearchNTalk started on port %d in %s mode",Config.get(Config.DASHBOARD_HTTPS_PORT), secureApp.settings.env);
}

function serverStartupAction()
{
    var scheduledTaskDelegate:ScheduledTaskDelegate = ScheduledTaskDelegate.getInstance();

    // Sync scheduled tasks from cache and create the call scheduler task if doesn't already exist
    log4js.getDefaultLogger().debug('Fetching tasks from redis');

    scheduledTaskDelegate.syncFromRedis()
        .done(
        function tasksSynced()
        {
            log4js.getDefaultLogger().debug('Tasks synced from redis. Scheduling timezone and call scheduler tasks');

            var newTasks:q.Promise<number>[] = [scheduledTaskDelegate.scheduleAfter(new TimezoneRefreshTask(), 1)];

            if (Utils.isNullOrEmpty(scheduledTaskDelegate.find(ScheduledTaskType.CALL_SCHEDULE)))
                newTasks.push(scheduledTaskDelegate.scheduleAfter(new ScheduleCallsScheduledTask(), 1));

            return q.all(newTasks);
        });

    scheduledTaskDelegate.on('taskCompletedEvent', function(taskType:ScheduledTaskType){
        if (taskType === ScheduledTaskType.TIMEZONE_REFRESH)
        {
            log4js.getDefaultLogger().debug('Timezones updated');
            appInit.helpers['Timezone'] = TimezoneDelegate.TIMEZONES;
        }
    });

    // Update integration cache
    new IntegrationDelegate().updateCache();
}