import BaseModel                                                    = require('../models/BaseModel');

class Timezone extends BaseModel
{
    private zone_id:number;
    private abbreviation:string;
    private time_start:number;
    private gmt_offset:number;
    private dst:number;

    /* Getters */
    getZoneId():number                                              { return this.zone_id; }
    getAbbreviation():string                                        { return this.abbreviation; }
    getTimeStart():number                                           { return this.time_start; }
    getGmtOffset():number                                           { return this.gmt_offset; }
    getDst():number                                                 { return this.dst; }

    /* Setters */
    setZoneId(val:number)                                           { this.zone_id = val; }
    setAbbreviation(val:string)                                     { this.abbreviation = val; }
    setTimeStart(val:number)                                        { this.time_start = val; }
    setGmtOffset(val:number)                                        { this.gmt_offset = val; }
    setDst(val:number)                                              { this.dst = val; }
}
export = Timezone