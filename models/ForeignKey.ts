///<reference path='../_references.d.ts'/>
import AbstractModel                                            = require('./AbstractModel');
import ForeignKeyType                                       = require('../enums/ForeignKeyType');

class ForeignKey
{
    type:ForeignKeyType;
    src_key:string;
    referenced_table:typeof AbstractModel;
    target_key:string;
    ne:string;

    constructor(type:ForeignKeyType, srcKey:string, referenced_table:typeof AbstractModel, targetKey:string, localPropertyToSet?:string)
    {
        this.type = type;
        this.src_key = srcKey;
        this.referenced_table = referenced_table;
        this.target_key = targetKey;
        this.local_property_to_set = localPropertyToSet;
    }

    // Helper method to get the name of the property to set in the base object after the results are fetched
    getSourcePropertyName():string
    {
        // 1. If src_key contains the property name -> Excellent
        // 2. If target_key contains the

        return this.local_property_to_set || (this.src_key.indexOf('_id') != -1 ? this.src_key.replace('_id', '') : this.target_key.replace('_id', ''));
    }

    toString():string { return '[object ForeignKey]'; }
}
export = ForeignKey