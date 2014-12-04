///<reference path='../_references.d.ts'/>
import _                                                    = require('underscore');
import q                                                    = require('q');
import IDaoFetchOptions                                     = require('./IDaoFetchOptions');
import MysqlDao                                             = require('./MysqlDao');
import BaseModel                                            = require('../models/BaseModel');
import ForeignKey                                           = require('../models/ForeignKey');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import Utils                                                = require('../common/Utils');

class BaseMappingDao extends MysqlDao
{
    search(searchQuery:Object, options:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    {
        // Create join query to fetch the mapped resource automatically
        var self = this;
        var fk:ForeignKey = this.modelClass['FOREIGN_KEYS'][0];
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(fk.getSourcePropertyName());
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var whereStatements = this.generateWhereStatements(searchQuery);
        var wheres = _.map(whereStatements.where, function(where) {
            return self.modelClass.TABLE_NAME + '.' + where;
        });
        var values = whereStatements.values;

        // Namespace columns in the SQL query so we can segregate them later
        var mappingColumnNames = _.map(this.modelClass['COLUMNS'], function (colName)
        {
            return self.modelClass.TABLE_NAME + '.' + colName;
        }).join(',');

        var query:string = 'SELECT ' + mappingColumnNames + ',' + fk.referenced_table.TABLE_NAME +'.* ' +
            'FROM ' + this.modelClass.TABLE_NAME + ',' + fk.referenced_table.TABLE_NAME + ' ' +
            'WHERE ' + wheres.join(' AND ') + ' ' +
            'AND ' + this.modelClass.TABLE_NAME + '.' + fk.src_key + ' = ' + fk.referenced_table.TABLE_NAME + '.' + fk.target_key;

        return self.mysqlDelegate.executeQuery(query, values, transaction)
            .then(
            function handleResults(rows:Object[])
            {
                var nameSpaceMappings = {};
                _.each(self.modelClass['COLUMNS'], function(colName) {
                    nameSpaceMappings[self.modelClass.TABLE_NAME + '.' + colName] = colName;
                });

                // 2. Collect unique mapped objects
                var referencedObjects = _.map(rows, function(row)
                {
                    return new fk.referenced_table(row);
                });

                // 3. Merge and return
                return _.map(rows, function (row:Object)
                {
                    var mappingObject = _.findWhere(referencedObjects, Utils.createSimpleObject(fk.target_key, row[self.modelClass.TABLE_NAME + "." + fk.src_key]));

                    // Remove the namespacing prefix from columns
                    _.each(_.keys(row), function(key:string)
                    {
                        row[nameSpaceMappings[key]] = row[key];
                    });

                    var typedMappingObject = new self.modelClass(row);
                    typedMappingObject[setterMethod].call(typedMappingObject, mappingObject);
                    return typedMappingObject;
                });
            })
            .fail(
            function handleFailure(error:Error)
            {
                self.logger.error('SEARCH failed for mapping table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
                throw(error);
            });
    }
}
export = BaseMappingDao