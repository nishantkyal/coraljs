///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import log4js                                   = require('log4js');
import Utils                                    = require('../common/Utils');

/**
 * Base class for Models
 */
class BaseModel
{
    static TABLE_NAME:string;

    static ID:string = 'id';
    static CREATED:string = 'created';
    static UPDATED:string = 'updated';
    static DELETED:string = 'deleted';

    logger:log4js.Logger;
    private __proto__;

    private id:number;
    private created:number;
    private updated:number;
    private deleted:boolean;

    constructor(data:Object = {})
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));

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
    get(propertyName:string):any
    {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            this.logger.error('Non-existent property: ' + propertyName + ' referenced');
        return this[propertyName];
    }

    /* Setters */
    setId(val:number):void { this.id = val; }
    setCreated(val:number):void { this.created = val; }
    setUpdated(val:number):void { this.updated = val; }
    setDeleted(val:boolean):void { this.deleted = val; }
    set(propertyName:string, val:any):void
    {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            this.logger.error('Non-existent property: ' + propertyName + ' referenced');
        else
        {
            var setterMethodName:string = 'set' + Utils.snakeToCamelCase(propertyName);
            var setterMethod:Function = this[setterMethodName];
            if (setterMethod)
                setterMethod.call(this, val);
            else
                this.logger.error('Non-existent property: ' + propertyName + ' attempted setter');
        }
    }

    toJson():Object
    {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        var data = {};
        _.each (thisProtoConstructor['COLUMNS'], function(column:string) {
            try {
                data[column] = self[column].toJson();
            } catch (e) {
                data[column] = self[column];
            }
        });
        return data;
    }

}
export = BaseModel