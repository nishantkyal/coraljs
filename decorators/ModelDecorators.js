"use strict";
require("reflect-metadata");
var ModelDecorators = (function () {
    function ModelDecorators() {
    }
    ModelDecorators.tableName = function (tableName) {
        return function (target) {
            target.__proto__.TABLE_NAME = tableName;
        };
    };
    ModelDecorators.columnName = function (colName) {
        return Reflect.metadata("columnName", colName);
    };
    ModelDecorators.getColumnName = function (target, propertyKey) {
        return Reflect.getMetadata("columnName", target, propertyKey);
    };
    return ModelDecorators;
}());
module.exports = ModelDecorators;
//# sourceMappingURL=ModelDecorators.js.map