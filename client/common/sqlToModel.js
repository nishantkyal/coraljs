define(["require", "exports", 'underscore', './Utils'], function (require, exports, _, Utils) {
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
        sqlToModel.sqlToModel = function (sql) {
            var fields = sqlToModel.sqlToObject(sql);
            var model = '';
            var keys = _.keys(fields);
            _.each(keys, function (key) {
                if (!Utils.isNullOrEmpty(key))
                    console.log('static COL_%s:string = \'%s\';', key.toUpperCase(), key);
            });
            _.each(keys, function (key) {
                var value = fields[key];
                if (!Utils.isNullOrEmpty(key))
                    console.log('private %s:%s;', key, sqlToModel.sqlTypeToJsType(value));
            });
            _.each(keys, function (key) {
                var value = fields[key];
                if (!Utils.isNullOrEmpty(key))
                    console.log('get%s():%s                     { return this.%s; }', Utils.snakeToCamelCase(key), sqlToModel.sqlTypeToJsType(value), key);
            });
            _.each(keys, function (key) {
                var value = fields[key];
                if (!Utils.isNullOrEmpty(key))
                    console.log('set%s(val:%s)                  { this.%s = val; }', Utils.snakeToCamelCase(key), sqlToModel.sqlTypeToJsType(value), key);
            });
            return model;
        };
        return sqlToModel;
    })();
    return sqlToModel;
});
//# sourceMappingURL=sqlToModel.js.map