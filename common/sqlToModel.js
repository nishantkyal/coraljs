"use strict";
var _ = require("underscore");
var sqlToModel = (function () {
    function sqlToModel() {
    }
    sqlToModel.sqlTypeToJsType = function (value) {
        var temp = '';
        switch (value) {
            case 'bigint':
            case 'int':
                temp += 'number';
                break;
            case 'varchar':
            case 'text':
                temp += 'string';
                break;
            case 'tinyint':
            case 'boolean':
                temp += 'boolean';
                break;
        }
        return temp;
    };
    sqlToModel.sqlToObject = function (sql) {
        var fields = {};
        _.each(sql.split(','), function (temp) {
            var key = temp.split(' ')[0].replace(/`/g, '');
            var value = temp.split(' ')[1].replace(/\(.*\)/, '');
            fields[key] = value;
        });
        return fields;
    };
    return sqlToModel;
}());
module.exports = sqlToModel;
//# sourceMappingURL=sqlToModel.js.map