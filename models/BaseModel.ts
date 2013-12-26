import _            = require('underscore');
import Utils        = require('../Utils');

/**
 * Base class for Models
 */
class BaseModel {

    static TABLE_NAME:string = null;
    static PRIMARY_KEY:string = 'id';

    private id:number;
    private created:number;
    private updated:number;
    private deleted:boolean;

    constructor(data:Object = {})
    {
        this.init(data);
        for (var key in this) {
            if (typeof this[key] != 'function') {
                this[key] = data[key];
            }
        }
    }

    init(data:Object)
    {
        Utils.copyProperties(data, this);
    }

    /* Getters */
    getId():number { return this.id; }
    getCreated():number { return this.created; }
    getUpdated():number { return this.updated; }
    getDeleted():boolean { return this.deleted; }

    /* Setters */
    setId(val:number):void { this.id = val; }
    setCreated(val:number):void { this.created = val; }
    setUpdated(val:number):void { this.updated = val; }
    setDeleted(val:boolean):void { this.deleted = val; }

}
export = BaseModel