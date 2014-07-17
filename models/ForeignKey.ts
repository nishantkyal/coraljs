import BaseModel         = require('./BaseModel');

class ForeignKey
{
    srcKey:string;
    referenced_table:typeof BaseModel;
    targetKey:string;
    localPropertyToSet:string;

    constructor(srcKey:string, referenced_table:typeof BaseModel, targetKey:string, localPropertyToSet?:string)
    {
        this.srcKey = srcKey;
        this.referenced_table = referenced_table;
        this.targetKey = targetKey;
        this.localPropertyToSet = localPropertyToSet;
    }

}
export = ForeignKey