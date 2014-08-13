///<reference path='../_references.d.ts'/>
import _                    = require('underscore');
import Utils                = require('./Utils');

class sqlToModel
{
    static sqlTypeToJsType(value):string
    {
        var temp:string = '';
        switch(value)
        {
            case 'bigint':
            case 'int':
                temp += 'number'
                break;

            case 'varchar':
                temp += 'string'
                break;

            case 'tinyint':
            case 'boolean':
                temp += 'boolean'
                break;
        }
        return temp;
    }

    static sqlToObject(sql:string):Object
    {
        var fields = {};
        _.each(sql.split(','), function(temp:string){
            var key = temp.split(' ')[0].replace(/`/g,'');
            var value = temp.split(' ')[1].replace(/\(.*\)/,'');
            fields[key] = value;
        })
        return fields;
    }

    static sqlToModel(sql:string):string
    {
        var fields =  sqlToModel.sqlToObject(sql);
        var model:string = '';
        var keys = _.keys(fields);

        _.each(keys, function(key){
            if(!Utils.isNullOrEmpty(key))
                console.log('static COL_%s:string = \'%s\';',key.toUpperCase(),key);
        })

        _.each(keys, function(key){
            var value = fields[key];
            if(!Utils.isNullOrEmpty(key))
                console.log('private %s:%s;',key,sqlToModel.sqlTypeToJsType(value));
        })

        _.each(keys, function(key){
            var value = fields[key];
            if(!Utils.isNullOrEmpty(key))
                console.log('get%s():%s                     { return this.%s; }',Utils.snakeToCamelCase(key),sqlToModel.sqlTypeToJsType(value),key);
        })

        _.each(keys, function(key){
            var value = fields[key];
            if(!Utils.isNullOrEmpty(key))
                console.log('set%s(val:%s)                  { this.%s = val; }',Utils.snakeToCamelCase(key),sqlToModel.sqlTypeToJsType(value),key);
        })

        return model;
    }
}
export = sqlToModel