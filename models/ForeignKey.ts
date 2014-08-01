import BaseModel                                            = require('./BaseModel');
import ForeignKeyType                                       = require('../enums/ForeignKeyType');

class ForeignKey
{
    type:ForeignKeyType;
    srcKey:string;
    referenced_table:typeof BaseModel;
    targetKey:string;
    localPropertyToSet:string;

    constructor(type:ForeignKeyType, srcKey:string, referenced_table:typeof BaseModel, targetKey:string, localPropertyToSet?:string)
    {
        this.type = type;
        this.srcKey = srcKey;
        this.referenced_table = referenced_table;
        this.targetKey = targetKey;
        this.localPropertyToSet = localPropertyToSet;
    }

    // Helper method to get the name of the property to set in the base object after the results are fetched
    getSourcePropertyName():string
    {
        // 1. If srcKey contains the property name -> Excellent
        // 2. If targetKey contains the

        return this.localPropertyToSet || (this.srcKey.indexOf('_id') != -1 ? this.srcKey.replace('_id', '') : this.targetKey.replace('_id', ''));
    }

    toString():string { return '[object ForeignKey]'; }
}
export = ForeignKey