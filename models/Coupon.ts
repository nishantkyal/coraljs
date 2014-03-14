///<reference path='../_references.d.ts'/>
import BaseModel                                      = require('../models/BaseModel');
import MoneyUnit                                      = require('../enums/MoneyUnit');

class Coupon extends BaseModel
{
    private free_mins:number;
    private num_used:number;
    private max_coupons:number;
    private discount_amount:number;
    private discount_unit:MoneyUnit;
    private expiry_time:number;

    /* Getters */
    getFreeMins():number                                    { return this.free_mins; }
    getNumUsed():number                                     { return this.num_used; }
    getMaxCoupons():number                                  { return this.max_coupons; }
    getDiscountAmount():number                              { return this.discount_amount; }
    getDiscountUnit():number                                { return this.discount_unit; }
    getExpiryTime():number                                  { return this.expiry_time; }

    /* Setters */
    setFreeMins(val:number):void                            { this.free_mins = val; }
    setNumUsed(val:number):void                             { this.num_used = val; }
    setMaxCoupons(val:number):void                          { this.max_coupons = val; }
    setDiscountAmount(val:number):void                      { this.discount_amount = val; }
    setDiscountUnit(val:number):void                        { this.discount_unit = val; }
    setExpiryTime(val:number):void                          { this.expiry_time = val; }

}
export = Coupon