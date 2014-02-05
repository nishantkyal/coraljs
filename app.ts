///<reference path='./_references.d.ts'/>
///<reference path='./common/Config.ts'/>
///<reference path='./delegates/MysqlDelegate.ts'/>
///<reference path='./middleware/ValidateRequest.ts'/>
///<reference path='./api/index.ts'/>
//import express          = require('express');

module app
{
    var app;
    /*app = express();

    //app.set('port', common.Config.get('Coral.port') || 3000);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(middleware.ValidateRequest.parseBody);
    app.enable('trust proxy');

    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    app.listen(app.get('port'), function()
    {
        console.log("Demo Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
    });*/

    // REST APIs
    api.init(app);
}
