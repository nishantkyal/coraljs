///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import Utils                                            = require('../common/Utils');
import AbstractModel                                    = require('./AbstractModel');
import ForeignKey                                       = require('../models/ForeignKey');
/*
 * Base class for Models
 */
class BaseModel extends AbstractModel
{
    static ID:string = 'id';
    static CREATED:string = 'created';
    static UPDATED:string = 'updated';
    static DELETED:string = 'deleted';
    static _INITIALIZED:boolean = false;

    private id:number;
    private created:number;
    private updated:number;
    private deleted:boolean;

    static DEFAULT_FIELDS:string[] = [BaseModel.ID];
    static TIMESTAMP_FIELDS:string[] = [BaseModel.CREATED, BaseModel.UPDATED, BaseModel.DELETED];


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
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            throw('Non-existent property: ' + propertyName + ' referenced');
        else
        {
            var setterMethodName:string = 'set' + Utils.snakeToCamelCase(propertyName);
            var setterMethod:Function = thisProtoConstructor[setterMethodName];
            if (setterMethod)
                setterMethod.call(this, val);
            else
                throw('Non-existent property: ' + propertyName + ' attempted setter');
        }
    }

    isValid():boolean { return true; }

    /* Foreign key methods */
    hasOne(fk:ForeignKey):void
    {
        // TODO: Name assumption here that keys will have _id suffix
        var srcPropertyName:string = fk.srcKey.replace('_id', '');
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod:string = 'get' + srcPropertyNameCamelCase;
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var thisProtoConstructor = this.__proto__.constructor;

        // Getter method
        thisProtoConstructor[getterMethod] = function():Object
        {
            if (_.isArray(this[srcPropertyName]))
                this[srcPropertyName] = _.findWhere(this[srcPropertyName], Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]));
            return this[srcPropertyName];
        };

        // Setter method
        thisProtoConstructor[setterMethod] = function(val:any):void
        {
            if (_.isArray(val))
                val = _.findWhere(val, Utils.createSimpleObject(fk.targetKey, this[fk.srcKey]));
            this[srcPropertyName] = val;
        };
    }

    hasMany(fk:ForeignKey):void
    {
        // TODO: Name assumption here that keys will have _id suffix
        var srcPropertyName:string = fk.srcKey.replace('_id', '');
        var srcPropertyNameCamelCase:string = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod:string = 'get' + srcPropertyNameCamelCase;
        var setterMethod:string = 'set' + srcPropertyNameCamelCase;
        var thisProtoConstructor = this.__proto__.constructor;

        // Getter method
        thisProtoConstructor[getterMethod] = function():Object
        {
            if (_.isObject(this[srcPropertyName]) && this[srcPropertyName][fk.targetKey] == this[fk.srcKey])
                this[srcPropertyName] = [this[srcPropertyName]];
            return this[srcPropertyName];
        };

        // Setter method
        thisProtoConstructor[setterMethod] = function(val:any):void
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