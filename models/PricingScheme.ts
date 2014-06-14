import BaseModel                                                = require('../models/BaseModel');
import MoneyUnit                                                = require('../enums/MoneyUnit');

class PricingScheme extends BaseModel
{
    private integration_member_id:number;
    private charging_rate:number;
    private unit:MoneyUnit;
    private chunk_size:number;                                  // Sizes of chargeable time chunks
    private min_duration:number;                                // Min duration for the call

    /* Getters */
    getIntegrationMemberId():number                             { return this.integration_member_id; }
    getChargingRate():number                                    { return this.charging_rate; }
    getMoneyUnit():MoneyUnit                                    { return this.unit; }
    getChunkSize():number                                       { return this.chunk_size; }
    getMinDuration():number                                     { return this.min_duration; }

    /* Setters */
    setIntegrationMemberId(val:number)                          { this.integration_member_id; }
    setChargingRate(val:number)                                 { this.charging_rate; }
    setMoneyUnit(val:MoneyUnit)                                 { this.unit; }
    setChunkSize(val:number)                                    { this.chunk_size; }
    setMinDuration(val:number)                                  { this.min_duration; }
}
export = PricingScheme