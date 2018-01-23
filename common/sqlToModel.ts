import _                    = require('underscore');
import Utils                = require('./Utils');

class sqlToModel {
    static sqlTypeToJsType(value): string {
        var temp: string = '';
        switch (value) {
            case 'bigint':
            case 'int':
                temp += 'number'
                break;

            case 'varchar':
            case 'text':
                temp += 'string'
                break;

            case 'tinyint':
            case 'boolean':
                temp += 'boolean'
                break;
        }
        return temp;
    }

    static sqlToObject(sql: string): Object {
        var fields = {};
        _.each(sql.split(','), function (temp: string) {
            var key = temp.split(' ')[0].replace(/`/g, '');
            var value = temp.split(' ')[1].replace(/\(.*\)/, '');
            fields[key] = value;
        })
        return fields;
    }
}

export = sqlToModel