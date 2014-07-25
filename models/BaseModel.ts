///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import Utils                                            = require('../common/Utils');
import AbstractModel                                    = require('./AbstractModel');
import ForeignKey                                       = require('../models/ForeignKey');
import ForeignKeyType                                   = require('../enums/ForeignKeyType');

/*
 * Base class for Models
 */
class BaseModel extends AbstractModel
{
    static COL_ID:string = 'id';
    static COL_CREATED:string = 'created';
    static COL_UPDATED:string = 'updated';
    static COL_DELETED:string = 'deleted';
    static _INITIALIZED:boolean = false;

    private id:number;
    private created:number;
    private updated:number;
    private deleted:boolean;

    static PUBLIC_FIELDS:string[] = [BaseModel.COL_ID];

    constructor(data:Object = {})
    {
        super(data);
        var thisProtoConstructor = this.__proto__.constructor;

        for (var classProperty in thisProtoConstructor)
            if (Utils.getObjectType(thisProtoConstructor[classProperty]) == 'ForeignKey'
                && classProperty.match(/^FK_/) != null)
            {
                var fk:ForeignKey = thisProtoConstructor[classProperty];
                switch(fk.type)
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

    /* Getters */
    getId():number                                      { return this.id; }
    getCreated():number                                 { return this.created; }
    getUpdated():number                                 { return this.updated; }
    getDeleted():boolean                                { return this.deleted; }

    /*get(propertyName:string):any
    {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            throw('Non-existent property: ' + propertyName + ' referenced');
        return this[propertyName];
    }*/

    /* Setters */
    setId(val:number):void                              { this.id = val; }
    setCreated(val:number):void                         { this.created = val; }
    setUpdated(val:number):void                         { this.updated = val; }
    setDeleted(val:boolean):void                        { this.deleted = val; }

    set(propertyName:string, val:any):void
    {
        var thisProto = this.__proto__;
        if (thisProto['COLUMNS'].indexOf(propertyName) == -1)
            throw('Non-existent property: ' + propertyName + ' referenced');
        else
        {
            var setterMethodName:string = 'set' + Utils.snakeToCamelCase(propertyName);
            var setterMethod:Function = thisProto[setterMethodName];
            if (setterMethod)
                setterMethod.call(this, val);
            else
                throw('Non-existent property: Tried calling non-existent setter: ' + setterMethodName + ' for model: ' + Utils.getClassName(this));
        }
    }

    isValid():boolean { return true; }

    /* Foreign key methods */
    private hasOne(fk:ForeignKey):void
    {
        // FIXME: Foreign key association where srcKey name doesn't contain _id uses targetKey name
        var srcPropertyName:string = fk.localPropertyToSet || (fk.srcKey.indexOf('_id') != -1 ? fk.srcKey.replace('_id', '') : fk.targetKey.replace('_id', ''));
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod:string = 'get' + srcPropertyNameCamelCase;
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;

        // Getter method
        thisProto[getterMethod] = function():Object
        {
            if (_.isArray(this[srcPropertyName]))
                this[srcPropertyName] = _.findWhere(this[srcPropertyName], Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]));
            return this[srcPropertyName];
        };

        // Setter method
        thisProto[setterMethod] = function(val:any):void
        {
            if (_.isArray(val))
                val = _.findWhere(val, Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]));
            this[srcPropertyName] = val;
        };
    }

    private hasMany(fk:ForeignKey):void
    {
        // FIXME: Foreign key association where srcKey name doesn't contain _id uses targetKey name
        var srcPropertyName:string = fk.localPropertyToSet || (fk.srcKey.indexOf('_id') != -1 ? fk.srcKey.replace('_id', '') : fk.targetKey.replace('_id', ''));
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod:string = 'get' + srcPropertyNameCamelCase;
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;

        // Getter method
        thisProto[getterMethod] = function():Object
        {
            if (_.isObject(this[srcPropertyName]) && this[srcPropertyName][fk.targetKey] == this[fk.srcKey])
                this[srcPropertyName] = [this[srcPropertyName]];
            return this[srcPropertyName];
        };

        // Setter method
        thisProto[setterMethod] = function(val:any):void
        {
            if (_.isObject(val) && val[fk.targetKey] == this[fk.srcKey])
                val = [val];
            if (_.isArray(val))
                val = _.where(val, Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]));
            this[srcPropertyName] = val;
        };

    }
}
export = BaseModel