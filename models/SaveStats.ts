import BaseModel                                                = require('../models/BaseModel');

class SaveStats extends BaseModel
{
    static TABLE_NAME:string                                    = 'stats';

    static COL_NAME:string                                      = 'name';
    static COL_COUNT:string                                     = 'count';
    static COL_TYPE:string                                      = 'type';

    static PUBLIC_FIELDS:string[] = [SaveStats.COL_ID, SaveStats.COL_NAME, SaveStats.COL_COUNT, SaveStats.COL_TYPE];

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