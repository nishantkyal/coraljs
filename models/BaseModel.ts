///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import Utils                                    = require('../common/Utils');

/*
 * Base class for Models
 */
class BaseModel
{
    static TABLE_NAME:string;

    static ID:string = 'id';
    static CREATED:string = 'created';
    static UPDATED:string = 'updated';
    static DELETED:string = 'deleted';

    private __proto__;

    private id:number;
    private created:number;
    private updated:number;
    private deleted:boolean;

    constructor(data:Object = {})
    {
        var thisProtoConstructor = this.__proto__.constructor;
        thisProtoConstructor['COLUMNS'] = thisProtoConstructor['COLUMNS'] || [];
        var self = this;

        if (thisProtoConstructor['COLUMNS'].length == 0)
            for (var classProperty in this.__proto__)
                if (typeof this.__proto__[classProperty] == 'function' && classProperty.match(/^get/) != null)
                {
                    var key:string = Utils.camelToSnakeCase(classProperty.replace(/^get/, ''));
                    thisProtoConstructor['COLUMNS'].push(key);
                }

        _.each (thisProtoConstructor['COLUMNS'], function(column:string) {
            self[column] = data[column];
        });
    }

    /* Getters */
    getId():number { return this.id; }
    getCreated():number { return this.created; }
    getUpdated():number { return this.updated; }
    getDeleted():boolean { return this.deleted; }
    /*get(propertyName:string):any
    {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            throw('Non-existent property: ' + propertyName + ' referenced');
        return this[propertyName];
    }*/

    /* Setters */
    setId(val:number):void { this.id = val; }
    setCreated(val:number):void { this.created = val; }
    setUpdated(val:number):void { this.updated = val; }
    setDeleted(val:boolean):void { this.deleted = val; }
    set(propertyName:string, val:any):void
    {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            throw('Non-existent property: ' + propertyName + ' referenced');
        else
        {
            var setterMethodName:string = 'set' + Utils.snakeToCamelCase(propertyName);
            var setterMethod:Function = this[setterMethodName];
            if (setterMethod)
                setterMethod.call(this, val);
            else
                throw('Non-existent property: ' + propertyName + ' attempted setter');
        }
    }

    toJson():Object
    {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        var data = {};
        _.each (thisProtoConstructor['COLUMNS'], function(column:string) {
            if (Utils.getObjectType(self[column]) == 'Array')
            {
                data[column] = _.map(self[column], function(obj:any)
                {
                    return obj.toJson();
                });
            }
            else
            {
                try {
                    data[column] = self[column].toJson();
                } catch (e) {
                    data[column] = self[column];
                }
            }
        });
        return data;
    }

    isValid():boolean { return true; }

    toString():string { return '[object ' + Utils.getClassName(this) + ']'; }

}
export = BaseModel