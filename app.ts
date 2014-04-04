///<reference path='./_references.d.ts'/>
import _                                            = require('underscore');
import express                                      = require('express');
var connect                                         = require('connect');
var RedisStore                                      = require('connect-redis')(connect);
import connect_flash                                = require("connect-flash");
import http                                         = require('http');
import path                                         = require('path');
import passport                                     = require('passport');
import log4js                                       = require('log4js');
import moment                                       = require('moment');
import Config                                       = require('./common/Config');
import Formatter                                    = require('./common/Formatter');
import ApiUrlDelegate                               = require('./delegates/ApiUrlDelegate');
import MysqlDelegate                                = require('./delegates/MysqlDelegate');
import IntegrationDelegate                          = require('./delegates/IntegrationDelegate');
import RequestHandler                               = require('./middleware/RequestHandler');
import api                                          = require('./api/index');
import routes                                       = require('./routes/index');
import CountryCode                                  = require('./enums/CountryCode');
import IndustryCodes                                = require('./enums/IndustryCodes');
import CallFlowUrls                                 = require('./routes/callFlow/Urls');
import DashboardUrls                                = require('./routes/dashboard/Urls');

log4js.configure('/var/searchntalk/config/log4js.json');

var app:express.Application = express();

// all environments
app.use(express.compress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(
    function (req, res, next)
    {
        res.locals.formatMoney = Formatter.formatMoney;
        res.locals.formatRole = Formatter.formatRole;
        res.locals.formatName = Formatter.formatName;
        res.locals.formatSchedule = Formatter.formatSchedule;
        res.locals.formatDate = Formatter.formatDate;

        // Api urls
        res.locals.ApiUrlDelegate = ApiUrlDelegate;

        // Route urls
        res.locals.CallFlowUrls = CallFlowUrls;
        res.locals.DashboardUrls = DashboardUrls;

        res.locals.minYear = 1920;
        res.locals.currentYear = new Date().getFullYear();

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
api(app);
routes(app);

_.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

app.set('port', Config.get(Config.CORAL_PORT) || 3000);
app.listen(app.get('port'), function ()
{
    console.log("SearchNTalk started on port %d in %s mode", app.get('port'), app.settings.env);
});