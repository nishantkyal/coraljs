///<reference path='./_references.d.ts'/>
import _                                            = require('underscore');
import express                                      = require('express');
var connect                                         = require('connect');
var RedisStore                                      = require('connect-redis')(connect);
import connect_flash                                = require("connect-flash");
import http                                         = require('http');
import https                                        = require('https');
import path                                         = require('path');
import passport                                     = require('passport');
import log4js                                       = require('log4js');
import moment                                       = require('moment');
import ScheduleCallsScheduledTask                   = require('./models/tasks/ScheduleCallsScheduledTask');
import Config                                       = require('./common/Config');
import Formatter                                    = require('./common/Formatter');
import Utils                                        = require('./common/Utils');
import ApiUrlDelegate                               = require('./delegates/ApiUrlDelegate');
import MysqlDelegate                                = require('./delegates/MysqlDelegate');
import IntegrationDelegate                          = require('./delegates/IntegrationDelegate');
import ScheduledTaskDelegate                        = require('./delegates/ScheduledTaskDelegate');
import RequestHandler                               = require('./middleware/RequestHandler');
import api                                          = require('./api/index');
import routes                                       = require('./routes/index');
import CountryCode                                  = require('./enums/CountryCode');
import IndustryCode                                 = require('./enums/IndustryCode');
import CountryName                                  = require('./enums/CountryName');
import Salutation                                   = require('./enums/Salutation');
import CallFlowUrls                                 = require('./routes/callFlow/Urls');
import DashboardUrls                                = require('./routes/dashboard/Urls');

log4js.configure('/var/searchntalk/config/log4js.json');

var app:express.Application = express();

// View helpers
var helpers = {
    formatMoney: Formatter.formatMoney,
    formatRole: Formatter.formatRole,
    formatName: Formatter.formatName,
    formatSchedule: Formatter.formatSchedule,
    formatDate: Formatter.formatDate,
    formatUserStatus:Formatter.formatUserStatus,
    ApiUrlDelegate: ApiUrlDelegate,
    CallFlowUrls: CallFlowUrls,
    DashboardUrls: DashboardUrls,
    IndustryCodes: _.filter(Utils.enumToNormalText(IndustryCode), function(code) {
        return Utils.getObjectType(code) == 'String';
    }),
    Salutation: _.filter(Utils.enumToNormalText(Salutation), function(s) {
        return Utils.getObjectType(s) == 'String';
    })
};

// all environments
app.use(express.compress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(
    function (req:express.Request, res, next)
    {
        // This middleware applies to all urls except
        // 1. APIs (which start with "/rest")
        // 2. Static content (which start with "/js" or "/css" or "/img")
        var excludeRegex = /^\/(rest|css|js|img|fonts)/;

        if (Utils.isNullOrEmpty(req.path.match(excludeRegex)))
            _.extend(res.locals, helpers);

        next();
    }
)

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
api(app, secureApp);
routes(app, secureApp);

// Underscore template pattern
_.templateSettings = {
    evaluate: /\{\[([\s\S]+?)\]\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g
};
_.mixin(helpers);

app.set('port', Config.get(Config.DASHBOARD_HTTP_PORT));
app.listen(app.get('port'), function ()
{
    console.log("SearchNTalk started on port %d in %s mode", app.get('port'), app.settings.env);
});