///<reference path='./_references.d.ts'/>
import _                                            = require('underscore');
import q                                            = require('q');
import repl                                         = require('repl');
import express                                      = require('express');
var connect                                         = require('connect');
var RedisStore                                      = require('connect-redis')(connect);
import connect_flash                                = require("connect-flash");
import connect_ensure_login                         = require('connect-ensure-login');
import http                                         = require('http');
import https                                        = require('https');
import path                                         = require('path');
import passport                                     = require('passport');
import log4js                                       = require('log4js');
import moment                                       = require('moment');
import ScheduleCallsScheduledTask                   = require('./models/tasks/ScheduleCallsScheduledTask');
import TimezoneRefreshTask                          = require('./models/tasks/TimezoneRefreshTask');
import Config                                       = require('./common/Config');
import Formatter                                    = require('./common/Formatter');
import Utils                                        = require('./common/Utils');
import ApiUrlDelegate                               = require('./delegates/ApiUrlDelegate');
import MysqlDelegate                                = require('./delegates/MysqlDelegate');
import IntegrationDelegate                          = require('./delegates/IntegrationDelegate');
import ScheduledTaskDelegate                        = require('./delegates/ScheduledTaskDelegate');
import TimezoneDelegate                             = require('./delegates/TimezoneDelegate');
import RequestHandler                               = require('./middleware/RequestHandler');
import api                                          = require('./api/index');
import routes                                       = require('./routes/index');
import CountryCode                                  = require('./enums/CountryCode');
import IndustryCode                                 = require('./enums/IndustryCode');
import CountryName                                  = require('./enums/CountryName');
import Salutation                                   = require('./enums/Salutation');
import ItemType                                     = require('./enums/ItemType');
import CouponType                                   = require('./enums/CouponType');
import IntegrationMemberRole                        = require('./enums/IntegrationMemberRole');
import TransactionType                              = require('./enums/TransactionType');
import ScheduledTaskType                            = require('./enums/ScheduledTaskType');
import CallFlowUrls                                 = require('./routes/callFlow/Urls');
import DashboardUrls                                = require('./routes/dashboard/Urls');
import PaymentUrls                                  = require('./routes/payment/Urls');
import MemberRegistrationUrls                       = require('./routes/expertRegistration/Urls');
var pjson                                           = require('./package.json');

log4js.configure('/var/searchntalk/config/log4js.json');
Config.set(Config.VERSION, pjson['version']);

var app:express.Application = express();

// View helpers
var helpers =
{
    formatMoney: Formatter.formatMoney,
    formatRole: Formatter.formatRole,
    formatName: Formatter.formatName,
    formatSchedule: Formatter.formatSchedule,
    formatDate: Formatter.formatDate,
    formatUserStatus: Formatter.formatUserStatus,
    formatCallStatus: Formatter.formatCallStatus,
    formatPhone: Formatter.formatPhone,
    formatTimezone: Formatter.formatTimezone,
    moment: moment,

    ApiUrlDelegate: ApiUrlDelegate,
    CallFlowUrls: CallFlowUrls,
    DashboardUrls: DashboardUrls,
    PaymentUrls: PaymentUrls,
    MemberRegistrationUrls: MemberRegistrationUrls,

    Config: Config,
    escapeObject: Utils.escapeObject,
    unEscapeObject: Utils.unEscapeObject,

    IndustryCodes: Utils.enumToNormalText(IndustryCode),
    Salutation: Utils.enumToNormalText(Salutation),
    CouponType: Utils.enumToNormalText(CouponType),
    ItemType: Utils.enumToNormalText(ItemType),
    TransactionType: Utils.enumToNormalText(TransactionType),
    IntegrationMemberRole: Utils.enumToNormalText(IntegrationMemberRole),
    CountryCode: CountryCode,
    CountryName: Utils.enumToNormalText(CountryName.CountryName),

    minYear: Config.get(Config.MINIMUM_YEAR),
    currentYear: moment().format('YYYY')
};

/* Underscore settings and helpers */
_.templateSettings = {
    evaluate: /\{\[([\s\S]+?)\]\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g
};
_.mixin(helpers);
_.extend(_, helpers);

app.use(
    function (req:express.Request, res, next)
    {
        // This middleware applies to all urls except
        // 1. APIs (which start with "/rest")
        // 2. Static content (which start with "/js" or "/css" or "/img")
        var excludeRegex = /^\/(rest|css|js|images|img|fonts)/;

        if (Utils.isNullOrEmpty(req.path.match(excludeRegex)))
            _.extend(res.locals, helpers);

        next();
    }
)

// all environments
app.use(express.compress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var oneDay = 86400000;
app.use(express.static(path.join(__dirname, 'public'), {maxAge: oneDay}));

app.use(express.json());
app.use(express.urlencoded());

app.use(express.methodOverride());
app.use(RequestHandler.parseRequest);
app.use(express.cookieParser());

app.use(express.session({
    secret: 'searchntalk.com',
    cookie: {maxAge: Config.get(Config.SESSION_EXPIRY)},
    store: new RedisStore({
        host: Config.get(Config.REDIS_HOST),
        port: Config.get(Config.REDIS_PORT)
    })
}));

app.use(passport.initialize());
app.use(passport.session({}));
app.use(connect_flash());


// APIs and Route endpoints
api(app);
routes(app);

/* Error Pages */
app.use(function (req, res, next)
{
    res.status(404);

    // respond with html page
    if (req.accepts('html'))
    {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json'))
    {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

app.use(function (err, req, res, next)
{
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    res.status(err.status || 500);
    res.render('500', { error: err });
});


app.configure('production', function ()
{
    app.enable('view cache');
});

app.set('port', Config.get(Config.DASHBOARD_HTTP_PORT));
app.listen(app.get('port'), function ()
{
    var scheduledTaskDelegate = ScheduledTaskDelegate.getInstance();

    // Sync scheduled tasks from cache and create the call scheduler task if doesn't already exist
    log4js.getDefaultLogger().debug('Fetching tasks from redis');

    scheduledTaskDelegate.syncFromRedis()
        .done(
        function tasksSynced()
        {
            log4js.getDefaultLogger().debug('Tasks synced from redis. Scheduling timezone and call scheduler tasks');

            var newTasks = [scheduledTaskDelegate.scheduleAfter(new TimezoneRefreshTask(), 1)];

            if (Utils.isNullOrEmpty(scheduledTaskDelegate.find(ScheduledTaskType.CALL_SCHEDULE)))
                newTasks.push(scheduledTaskDelegate.scheduleAfter(new ScheduleCallsScheduledTask(), 1));

            return q.all(newTasks);
        });

    scheduledTaskDelegate.on('taskCompletedEvent', function(taskType:ScheduledTaskType){
        if (taskType == ScheduledTaskType.TIMEZONE_REFRESH)
        {
            log4js.getDefaultLogger().debug('Timezones updated');
            helpers['Timezone'] = TimezoneDelegate.TIMEZONES;
        }
    })
    // Update integration cache
    new IntegrationDelegate().updateCache();

    log4js.getDefaultLogger().debug("SearchNTalk started on port %d in %s mode", app.get('port'), app.settings.env);
});
