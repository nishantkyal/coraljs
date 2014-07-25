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

}
export = ForeignKey