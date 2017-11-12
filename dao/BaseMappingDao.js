"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
///<reference path='../_references.d.ts'/>
const _ = require("underscore");
const MysqlDao = require("./MysqlDao");
const Utils = require("../common/Utils");
class BaseMappingDao extends MysqlDao {
    search(searchQuery, options, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create join query to fetch the mapped resource automatically
            var fk = this.modelClass['FOREIGN_KEYS'][0];
            var srcPropertyNameCamelCase = Utils.snakeToCamelCase(fk.getSourcePropertyName());
            var setterMethod = 'set' + srcPropertyNameCamelCase;
            var whereStatements = this.generateWhereStatements(searchQuery);
            var wheres = _.map(whereStatements.where, function (where) {
                return 'mapping.' + where;
            });
            var values = whereStatements.values;
            var self = this;
            // Namespace columns in the SQL query so we can segregate them later
            var mappingColumnNames = _.map(this.modelClass['COLUMNS'], function (colName) {
                return 'mapping.' + colName + ' AS "' + self.modelClass.TABLE_NAME + '.' + colName + '"';
            }).join(',');
            var query = 'SELECT ' + mappingColumnNames + ',referenced.* ' +
                'FROM ' + this.modelClass.TABLE_NAME + ' mapping, ' + fk.referenced_table.TABLE_NAME + ' referenced ' +
                'WHERE ' + wheres.join(' AND ') + ' ' +
                'AND mapping.' + fk.src_key + ' = referenced.' + fk.target_key;
            return self.mysqlDelegate.executeQuery(query, values, transaction)
                .then(function handleResults(rows) {
                var nameSpaceMappings = {};
                _.each(self.modelClass['COLUMNS'], function (colName) {
                    nameSpaceMappings[self.modelClass.TABLE_NAME + '.' + colName] = colName;
                });
                // 2. Collect unique mapped objects
                var referencedObjects = _.map(rows, function (row) {
                    return new fk.referenced_table(row);
                });
                // 3. Merge and return
                return _.map(rows, function (row) {
                    // Remove the namespacing prefix from columns
                    var mappingObject = _.findWhere(referencedObjects, Utils.createSimpleObject(fk.target_key, row[self.modelClass.TABLE_NAME + "." + fk.src_key]));
                    _.each(_.keys(row), function (key) {
                        row[nameSpaceMappings[key]] = row[key];
                    });
                    var typedMappingObject = new self.modelClass(row);
                    typedMappingObject[setterMethod].call(typedMappingObject, mappingObject);
                    return typedMappingObject;
                });
            })
                .catch(function handleFailure(error) {
                self.logger.error('SEARCH failed for mapping table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
                throw (error);
            });
        });
    }
}
module.exports = BaseMappingDao;
//# sourceMappingURL=BaseMappingDao.js.map