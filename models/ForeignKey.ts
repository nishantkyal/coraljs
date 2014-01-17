import BaseModel         = require('./BaseModel');

class ForeignKey
{
    srcKey:string;
    model:typeof BaseModel;
    targetKey:string;

    constructor(srcKey:string, model:typeof BaseModel, targetKey:string)
    {
        this.srcKey = srcKey;
        this.model = model;
        this.targetKey = targetKey;
    }

}
export = ForeignKey