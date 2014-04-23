///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import Utils                                    = require('../common/Utils');
import AbstractModel                            = require('./AbstractModel');

/*
 * Base class for Models
 */
class BaseModel extends AbstractModel
{
    static TABLE_NAME:string;

    static ID:string = 'id';
    static CREATED:string = 'created';
    static UPDATED:string = 'updated';
    static DELETED:string = 'deleted';

    private id:number;
    private created:number;
    private updated:number;
    private deleted:boolean;

    static DEFAULT_FIELDS:string[] = [BaseModel.ID];
    static TIMESTAMP_FIELDS:string[] = [BaseModel.CREATED, BaseModel.UPDATED, BaseModel.DELETED];


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

    isValid():boolean { return true; }

}
export = BaseModel