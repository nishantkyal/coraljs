"use strict";
require("reflect-metadata");
class ModelDecorators {
    static tableName(tableName) {
        return (target) => {
            target.__proto__.TABLE_NAME = tableName;
        };
    }
    static columnName(colName) {
        return Reflect.metadata("columnName", colName);
    }
    static getColumnName(target, propertyKey) {
        return Reflect.getMetadata("columnName", target, propertyKey);
    }
}
module.exports = ModelDecorators;
//# sourceMappingURL=ModelDecorators.js.map