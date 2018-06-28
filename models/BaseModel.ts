import _                                                = require('underscore');
import AbstractModel                                    = require('./AbstractModel');

/*
 * Base class for Models
 */
class BaseModel extends AbstractModel
{
    static COL_ID:string = 'id';
    static COL_CREATED:string = 'created';
    static COL_UPDATED:string = 'updated';
    static COL_DELETED:string = 'deleted';

    private id:number;
    private created:number;
    private updated:number;
    private deleted:boolean;

    /* Getters */
    getId():number                                      { return this.id; }
    getCreated():number                                 { return this.created; }
    getUpdated():number                                 { return this.updated; }
    getDeleted():boolean                                { return this.deleted; }


    /* Setters */
    setId(val:number):void                              { this.id = val; }
    setCreated(val:number):void                         { this.created = val; }
    setUpdated(val:number):void                         { this.updated = val; }
    setDeleted(val:boolean):void                        { this.deleted = val; }

    isValid():boolean { return true; }
}
export = BaseModel