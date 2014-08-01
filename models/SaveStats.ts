import BaseModel                                                = require('../models/BaseModel');

class SaveStats extends BaseModel
{
    static TABLE_NAME:string                                = 'stats';

    static NAME:string                                      = 'name';
    static COUNT:string                                     = 'count';
    static TYPE:string                                      = 'type';

    static DEFAULT_FIELDS:string[] = [SaveStats.ID,SaveStats.NAME, SaveStats.COUNT, SaveStats.TYPE];

    private name:string;
    private count:number;
    private type:string;

    /* Getters */
    getName():string                                                { return this.name; }
    getCount():number                                               { return this.count; }
    getType():string                                                { return this.type; }

    /* Setters */
    setName(val:string)                                             { this.name = val; }
    setCount(val:number)                                            { this.count = val; }
    setType(val:string)                                             { this.type = val; }
}
export = SaveStats