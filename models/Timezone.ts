import BaseModel                                                    = require('../models/BaseModel');

class Timezone extends BaseModel
{
    static COL_ZONE_ID:string                                       = 'zone_id';
    static COL_ABBREVIATION:string                                  = 'abbreviation';
    static COL_TIME_START:string                                    = 'time_start';
    static COL_GMT_OFFSET:string                                    = 'gmt_offset';
    static COL_DST:string                                           = 'dst';
    static COL_ZONE_NAME:string                                     = 'zone_name';
    static COL_COUNTRY_CODE:string                                  = 'country_code';
    static COL_COUNTRY_NAME:string                                  = 'country_name';

    private zone_id:number;
    private abbreviation:string;
    private time_start:number;
    private gmt_offset:number;
    private dst:number;
    private zone_name:string;
    private country_code:string;
    private country_name:string;

    /* Getters */
    getZoneId():number                                              { return this.zone_id; }
    getAbbreviation():string                                        { return this.abbreviation; }
    getTimeStart():number                                           { return this.time_start; }
    getGmtOffset():number                                           { return this.gmt_offset; }
    getDst():number                                                 { return this.dst; }
    getZoneName():string                                            { return this.zone_name; }
    getCountryCode():string                                         { return this.country_code; }
    getCountryName():string                                         { return this.country_name; }

    /* Setters */
    setZoneId(val:number)                                           { this.zone_id = val; }
    setAbbreviation(val:string)                                     { this.abbreviation = val; }
    setTimeStart(val:number)                                        { this.time_start = val; }
    setGmtOffset(val:number)                                        { this.gmt_offset = val; }
    setDst(val:number)                                              { this.dst = val; }
    setZoneName(val:string)                                         { this.zone_name = val; }
    setCountryCode(val:string)                                      { this.country_code = val; }
    setCountryName(val:string)                                      { this.country_name = val; }
}
export = Timezone