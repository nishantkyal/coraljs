var express = require('express');


var Config = require('./Config');

var app = express.createServer();

// all environments
app.set('port', Config.get('Coral.port') || 3000);
app.use(express.bodyParser());
app.use(express.methodOverride());

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// REST APIs
require('./api')(app);

app.listen(app.get('port'), function () {
    console.log("Demo Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

//# sourceMappingURL=app.js.map
