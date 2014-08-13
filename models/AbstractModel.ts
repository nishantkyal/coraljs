///<reference path='../_references.d.ts'/>
import log4js                                           = require('log4js');
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
    private static FOREIGN_KEYS:ForeignKey[] = [];
    private static _INITIALIZED:boolean = false;
    private logger = log4js.getLogger(Utils.getClassName(this));

    constructor(data:Object = {})
    {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;

        if (!thisProtoConstructor._INITIALIZED)
        {
            thisProtoConstructor['COLUMNS'] = [];
            thisProtoConstructor['FK_COLUMNS'] = [];
            thisProtoConstructor['FOREIGN_KEYS'] = [];

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
                if (Utils.getObjectType(thisProtoConstructor[classProperty]) == 'ForeignKey')
                {
                    var fk:ForeignKey = thisProtoConstructor[classProperty];
                    thisProtoConstructor['FK_COLUMNS'].push(fk.getSourcePropertyName());

                    // TODO: Also add reverse foreign keys to referenced model
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
                    thisProtoConstructor['FOREIGN_KEYS'].push(fk);
                }
            }

            thisProtoConstructor._INITIALIZED = true;
        }

        _.each(thisProtoConstructor['COLUMNS'], function (column:string)
        {
            self[column] = data[column];
        });

        _.each(thisProtoConstructor['FK_COLUMNS'], function (column:string)
        {
            var setterMethod:string = 'set' + Utils.snakeToCamelCase(column);
            if (!Utils.isNullOrEmpty(data[column]))
                self[setterMethod].call(self, data[column]);
        });
    }

    toJson():any
    {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        var data = {};
        var cols = thisProtoConstructor['COLUMNS'].concat(thisProtoConstructor['FK_COLUMNS']);
        _.each(cols, function (column:string)
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
            throw new Error('Non-existent property: ' + propertyName + ' referenced');
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
            throw new Error('Non-existent property: Tried calling non-existent setter: ' + setterMethodName + ' for model: ' + Utils.getClassName(this));
    }

    /* Foreign key methods */
    private hasOne(fk:ForeignKey):void
    {
        var srcPropertyName:string = fk.getSourcePropertyName();
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod:string = 'get' + srcPropertyNameCamelCase;
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;

        // Getter method
        thisProto[getterMethod] = function ():q.Promise<any>
        {
            var self = this;

            if (typeof this[srcPropertyName] != "undefined")
                return q.resolve(this[srcPropertyName]);

            self.logger.debug('Lazily Finding %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
            return fk.referenced_table.DELEGATE.find(Utils.createSimpleObject(fk.target_key, this[fk.src_key]))
                .then(
                function success(result)
                {
                    return self[setterMethod].call(self, result);
                })
                .then(
                function resultSet()
                {
                    return self[getterMethod].call(self);
                })
                .fail(
                function handleFailure(error:Error)
                {
                    self.logger.debug('Lazy loading failed for find %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                    throw error;
                });
        };

        // Setter method
        thisProto[setterMethod] = function (val:any):void
        {
            this[srcPropertyName] = null;

            if (_.isArray(val))
                this[srcPropertyName] = _.findWhere(val, Utils.createSimpleObject(fk.target_key, this[fk.src_key]));
            if (_.isObject(val) && val[fk.target_key] == this[fk.src_key])
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

        // Getter method
        thisProto[getterMethod] = function ():Object
        {
            var self = this;

            if (typeof this[srcPropertyName] != "undefined")
                return q.resolve(this[srcPropertyName]);

            self.logger.debug('Lazily Searching %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
            return fk.referenced_table.DELEGATE.search(Utils.createSimpleObject(fk.target_key, this[fk.src_key]))
                .then(
                function success(result)
                {
                    return self[setterMethod].call(self, result);
                })
                .then(
                function resultSet()
                {
                    return self[getterMethod].call(self);
                })
                .fail(
                function handleFailure(error:Error)
                {
                    self.logger.debug('Lazy loading failed for search %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                    throw error;
                });
        };

        // Setter method
        thisProto[setterMethod] = function (val:any):void
        {
            this[srcPropertyName] = null;

            if (_.isObject(val) && val[fk.target_key] == this[fk.src_key])
                this[srcPropertyName] = [val];
            if (_.isArray(val))
                this[srcPropertyName] = _.where(val, Utils.createSimpleObject(fk.target_key, this[fk.src_key]));
        };
    }

    static getForeignKeyForSrcKey(srcKey:string):ForeignKey
    {
        return _.findWhere(this['FOREIGN_KEYS'], {src_key: srcKey});
    }
}
export = AbstractModel