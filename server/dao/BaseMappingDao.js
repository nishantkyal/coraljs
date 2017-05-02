var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('underscore');
var MysqlDao = require('./MysqlDao');
var Utils = require('../common/Utils');
var BaseMappingDao = (function (_super) {
    __extends(BaseMappingDao, _super);
    function BaseMappingDao() {
        _super.apply(this, arguments);
    }
    BaseMappingDao.prototype.search = function (searchQuery, options, transaction) {
        var fk = this.modelClass['FOREIGN_KEYS'][0];
        var srcPropertyNameCamelCase = Utils.snakeToCamelCase(fk.getSourcePropertyName());
        var setterMethod = 'set' + srcPropertyNameCamelCase;
        var whereStatements = this.generateWhereStatements(searchQuery);
        var wheres = _.map(whereStatements.where, function (where) {
            return 'mapping.' + where;
        });
        var values = whereStatements.values;
        var self = this;
        var mappingColumnNames = _.map(this.modelClass['COLUMNS'], function (colName) {
            return 'mapping.' + colName + ' AS "' + self.modelClass.TABLE_NAME + '.' + colName + '"';
        }).join(',');
        var query = 'SELECT ' + mappingColumnNames + ',referenced.* ' + 'FROM ' + this.modelClass.TABLE_NAME + ' mapping, ' + fk.referenced_table.TABLE_NAME + ' referenced ' + 'WHERE ' + wheres.join(' AND ') + ' ' + 'AND mapping.' + fk.src_key + ' = referenced.' + fk.target_key;
        return self.mysqlDelegate.executeQuery(query, values, transaction).then(function handleResults(rows) {
            var nameSpaceMappings = {};
            _.each(self.modelClass['COLUMNS'], function (colName) {
                nameSpaceMappings[self.modelClass.TABLE_NAME + '.' + colName] = colName;
            });
            var referencedObjects = _.map(rows, function (row) {
                return new fk.referenced_table(row);
            });
            return _.map(rows, function (row) {
                var mappingObject = _.findWhere(referencedObjects, Utils.createSimpleObject(fk.target_key, row[self.modelClass.TABLE_NAME + "." + fk.src_key]));
                _.each(_.keys(row), function (key) {
                    row[nameSpaceMappings[key]] = row[key];
                });
                var typedMappingObject = new self.modelClass(row);
                typedMappingObject[setterMethod].call(typedMappingObject, mappingObject);
                return typedMappingObject;
            });
        }).fail(function handleFailure(error) {
            self.logger.error('SEARCH failed for mapping table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
            throw (error);
        });
    };
    return BaseMappingDao;
})(MysqlDao);
module.exports = BaseMappingDao;
//# sourceMappingURL=BaseMappingDao.js.map