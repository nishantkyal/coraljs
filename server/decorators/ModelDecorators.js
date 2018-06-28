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
}
module.exports = ModelDecorators;
//# sourceMappingURL=ModelDecorators.js.map