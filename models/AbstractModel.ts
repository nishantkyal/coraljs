import q                                                = require('q');
import _                                                = require('underscore');
import Utils                                            = require('../common/Utils');
import BaseDaoDelegate                                  = require('../delegates/BaseDaoDelegate');
import ForeignKeyType                                   = require('../enums/ForeignKeyType');
import ForeignKey                                       = require('../models/ForeignKey');

class AbstractModel
{
    __proto__;
    static TABLE_NAME:string;
    static DELEGATE:BaseDaoDelegate;
    private static _INITIALIZED:boolean = false;

    constructor(data:Object = {})
    {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;

        if (!thisProtoConstructor._INITIALIZED)
        {
            thisProtoConstructor['COLUMNS'] = [];

            for (var classProperty in thisProtoConstructor)
            {
                // Detect columns
                if (typeof thisProtoConstructor[classProperty] == 'string'
                    && classProperty.match(/^COL_/) != null)
                {
                    var key:string = classProperty.replace(/^COL_/, '').toLowerCase();
                    if (!Utils.isNullOrEmpty(key))
                        thisProtoConstructor['COLUMNS'].push(key);
                }

                // Detect Foreign Keys
                if (Utils.getObjectType(thisProtoConstructor[classProperty]) == 'ForeignKey'
                    && classProperty.match(/^FK_/) != null)
                {
                    var fk:ForeignKey = thisProtoConstructor[classProperty];
                    switch (fk.type)
                    {
                        case ForeignKeyType.ONE_TO_MANY:
                        case ForeignKeyType.MANY_TO_MANY:
                            this.hasMany(fk);
                            break;

                        case ForeignKeyType.MANY_TO_ONE:
                        case ForeignKeyType.ONE_TO_ONE:
                            this.hasOne(fk);
                            break;
                    }
                }
            }

            thisProtoConstructor._INITIALIZED = true;
        }

        _.each(thisProtoConstructor['COLUMNS'], function (column:string)
        {
            self[column] = data[column];
        });
    }

    toJson():any
    {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        var data = {};
        _.each(thisProtoConstructor['COLUMNS'], function (column:string)
        {
            if (Utils.getObjectType(self[column]) == 'Array')
            {
                data[column] = _.map(self[column], function (obj:any)
                {
                    return obj.toJson();
                });
            }
            else
            {
                try
                {
                    data[column] = self[column].toJson();
                } catch (e)
                {
                    data[column] = self[column];
                }
            }
        });
        return data;
    }

    toString():string { return '[object ' + Utils.getClassName(this) + ']'; }

    get(propertyName:string):any
    {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            throw('Non-existent property: ' + propertyName + ' referenced');
        return this[propertyName];
    }

    set(propertyName:string, val:any):void
    {
        var thisProto = this.__proto__;
        var setterMethodName:string = 'set' + Utils.snakeToCamelCase(propertyName);
        var setterMethod:Function = thisProto[setterMethodName];
        if (setterMethod)
            setterMethod.call(this, val);
        else
            throw('Non-existent property: Tried calling non-existent setter: ' + setterMethodName + ' for model: ' + Utils.getClassName(this));
    }

    /* Foreign key methods */
    private hasOne(fk:ForeignKey):void
    {
        var srcPropertyName:string = fk.getSourcePropertyName();
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod:string = 'get' + srcPropertyNameCamelCase;
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;
        var delegate = fk.referenced_table.DELEGATE;

        // Getter method
        thisProto[getterMethod] = function ():q.Promise<any>
        {
            if (this[srcPropertyName])
                return q.resolve(this[srcPropertyName]);

            return delegate.find(Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]))
                .then(
                    function success(result)
                    {
                        return self[setterMethod].call(self, result);
                    });
        };

        // Setter method
        thisProto[setterMethod] = function (val:any):void
        {
            this[srcPropertyName] = null;

            if (_.isArray(val))
                this[srcPropertyName] = _.findWhere(val, Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]));
            if (_.isObject(val) && val[fk.targetKey] == this[fk.srcKey])
                this[srcPropertyName] = val;
        };
    }

    private hasMany(fk:ForeignKey):void
    {
        var srcPropertyName:string = fk.getSourcePropertyName();
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod:string = 'get' + srcPropertyNameCamelCase;
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;
        var delegate = fk.referenced_table.DELEGATE;
        var self = this;

        // Getter method
        thisProto[getterMethod] = function ():Object
        {
            if (this[srcPropertyName])
                return q.resolve(this[srcPropertyName]);

            return delegate.search(Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]))
                .then(
                function success(result)
                {
                    return self[setterMethod].call(self, result);
                });
        };

        // Setter method
        thisProto[setterMethod] = function (val:any):void
        {
            this[srcPropertyName] = null;

            if (_.isObject(val) && val[fk.targetKey] == this[fk.srcKey])
                this[srcPropertyName] = [val];
            if (_.isArray(val))
                this[srcPropertyName] = _.where(val, Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]));
        };

    }
}
export = AbstractModel