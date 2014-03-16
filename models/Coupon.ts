///<reference path='../_references.d.ts'/>
import BaseModel                                      = require('../models/BaseModel');
import MoneyUnit                                      = require('../enums/MoneyUnit');

class Coupon extends BaseModel
{
    private num_used:number;
    private max_coupons:number;
    private discount_amount:number;
    private discount_unit:MoneyUnit;
    private expiry_time:number;
    private waive_network_charges:boolean;
    private integration_id:number;
    private expert_id:number;

    /* Getters */
    getNumUsed():number                                     { return this.num_used; }
    getMaxCoupons():number                                  { return this.max_coupons; }
    getDiscountAmount():number                              { return this.discount_amount; }
    getDiscountUnit():number                                { return this.discount_unit; }
    getExpiryTime():number                                  { return this.expiry_time; }
    getWaiveNetworkCharges():boolean                        { return this.waive_network_charges; }
    getIntegrationId():number                               { return this.integration_id; }
    getExpertId():number                                    { return this.expert_id; }

    /* Setters */
    setNumUsed(val:number):void                             { this.num_used = val; }
    setMaxCoupons(val:number):void                          { this.max_coupons = val; }
    setDiscountAmount(val:number):void                      { this.discount_amount = val; }
    setDiscountUnit(val:number):void                        { this.discount_unit = val; }
    setExpiryTime(val:number):void                          { this.expiry_time = val; }
    setWaiveNetworkCharges(val:boolean):void                { this.waive_network_charges = val; }
    setIntegrationId(val:number):void                       { this.integration_id = val; }
    setExpertId(val:number):void                            { this.expert_id = val; }

}
export = Coupon