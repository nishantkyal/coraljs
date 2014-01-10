import express          = require('express');
import http             = require('http');
import path             = require('path');
import Config           = require('./Config')
import MysqlDelegate    = require('./delegates/MysqlDelegate');

var app:express.ExpressServer = express.createServer();

// all environments
app.set('port', Config.get('Coral.port') || 3000);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.enable('trust proxy');

// Create relationships in models based on db schema
MysqlDelegate.createConnection()
    .then(
    function getForeignKeysFromSchemaAfterConnection(connection)
    {
        return MysqlDelegate.executeQuery('SELECT referenced_table_name, table_name, column_name, referenced_column_name ' +
            'FROM information_schema.KEY_COLUMN_USAGE  ' +
            'WHERE referenced_table_name IS NOT NULL ' +
            'AND constraint_name != "PRIMARY" ' +
            'AND table_schema = ' + Config.get('database.name'));
    })
    .then(
    function populateModelsWithForeignKeys(rows:Array)
    {
        for (var constraint in rows)
        {
            var srcTable = constraint['table_name'];
            var srcColumn = constraint['column_name'];
            var targetTable = constraint['referenced_table_name'];
            var targetColumn = constraint['referenced_table_name'];
        }
    });

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// REST APIs
require('./api')(app);

app.listen(app.get('port'), function()
{
    console.log("Demo Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});