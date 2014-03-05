///<reference path='./_references.d.ts'/>
import express                                      = require('express');
import http                                         = require('http');
import path                                         = require('path');
import passport                                     = require('passport');
import Config                                       = require('./common/Config')
import MysqlDelegate                                = require('./delegates/MysqlDelegate');
import RequestHandler                               = require('./middleware/RequestHandler');
import api                                          = require('./api/index');
import routes                                       = require('./routes/index');
import IntegrationCache                             = require('./caches/IntegrationCache');

var app:express.Application = express();
IntegrationCache.update();

// all environments
app.set('port', Config.get('Coral.port') || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(RequestHandler.parseRequest);
app.use(express.cookieParser());
app.use(express.session({secret: 'searchntalk.com'}));
app.use(passport.initialize());
app.use(passport.session({}));

// APIs and Route endpoints
api(app);
routes(app);

app.listen(app.get('port'), function()
{
    console.log("Demo Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});