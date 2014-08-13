import _                                                    = require('underscore');
import q                                                    = require('q');
import AbstractDao                                          = require('./AbstractDao');
import BaseModel                                            = require('../models/BaseModel');
import ForeignKey                                           = require('../models/ForeignKey');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import Utils                                                = require('../common/Utils');

class BaseMappingDao extends AbstractDao
{
    find(searchQuery:Object, fields?:string[], transaction?:Object):q.Promise<any>
    {
        return this.search(searchQuery, fields, transaction);
    }

    search(searchQuery:Object, fields?:string[], transaction?:Object):q.Promise<any>
    {
        // Create join query to fetch the mapped resource automatically
        var fk:ForeignKey = this.modelClass['FOREIGN_KEYS'][0];
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(fk.getSourcePropertyName());
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var whereStatements = this.generateWhereStatements(searchQuery);
        var wheres = _.map(whereStatements.where, function(where) {
            return 'mapping.' + where;
        });
        var values = whereStatements.values;
        var self = this;

        // Namespace columns in the SQL query so we can segregate them later
        var mappingColumnNames = _.map(this.modelClass['COLUMNS'], function (colName)
        {
            return 'mapping.' + colName + ' AS "'  + self.modelClass.TABLE_NAME + '.' + colName + '"';
        }).join(',');

        var query:string = 'SELECT ' + mappingColumnNames + ',referenced.* ' +
            'FROM ' + this.modelClass.TABLE_NAME + ' mapping, ' + fk.referenced_table.TABLE_NAME + ' referenced ' +
            'WHERE ' + wheres.join(' AND ') + ' ' +
            'AND mapping.' + fk.src_key + ' = referenced.' + fk.target_key + ' ' +
            'AND (mapping.deleted IS NULL OR mapping.deleted = 0)';

        return self.mysqlDelegate.executeQuery(query, values, transaction)
            .then(
            function handleResults(rows:Object[])
            {
                // 1. Collect unique base objects
                var uniqueSourceIds = _.uniq(_.pluck(rows, self.modelClass.TABLE_NAME + '.' + fk.src_key));

                // 2. Collect unique mapped objects
                var referencedObjects = _.map(rows, function(row)
                {
                    return new fk.referenced_table(row);
                });

                // 3. Merge and return
                return _.map(uniqueSourceIds, function (srcId:Object)
                {
                    // Remove the namespacing prefix from columns
                    var mappingObject = _.findWhere(rows, Utils.createSimpleObject(self.modelClass.TABLE_NAME + '.' + fk.src_key, srcId));
                    var nameSpaceMappings = {};
                    _.each(self.modelClass['COLUMNS'], function(colName) {
                       nameSpaceMappings[self.modelClass.TABLE_NAME + '.' + colName] = colName;
                    });

                    _.each(_.keys(mappingObject), function(key:string)
                    {
                        mappingObject[nameSpaceMappings[key]] = mappingObject[key];
                    });

                    var typedMappingObject = new self.modelClass(mappingObject);
                    typedMappingObject[setterMethod].call(typedMappingObject, referencedObjects);
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