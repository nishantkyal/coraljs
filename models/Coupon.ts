///<reference path='../_references.d.ts'/>
import BaseModel                                                = require('../models/BaseModel');
import IntegrationMember                                        = require('../models/IntegrationMember');
import MoneyUnit                                                = require('../enums/MoneyUnit');
import Utils                                                    = require('../common/Utils');

class Coupon extends BaseModel
{
    static TABLE_NAME:string = 'coupon';

    static CODE:string                      = 'code';
    static NUM_USED:string                  = 'num_used';
    static MAX_COUPONS:string               = 'max_coupons';
    static DISCOUNT_AMOUNT:string           = 'discount_amount';
    static DISCOUNT_UNIT:string             = 'discount_unit';
    static EXPIRY_TIME:string               = 'expiry_time';
    static WAIVE_NETWORK_CHARGES:string     = 'waive_network_charges';
    static INTEGRATION_ID:string            = 'integration_id';
    static EXPERT_ID:string                 = 'expert_id';
    static EXPERT:string                    = 'expert';

    private code:string;
    private num_used:number;
    private max_coupons:number;
    private discount_amount:number;
    private discount_unit:MoneyUnit;
    private expiry_time:number;
    private waive_network_charges:boolean;
    private integration_id:number;
    private expert_id:number;

    private expert:IntegrationMember;

    /* Getters */
    getCode():string                                        { return this.code.toUpperCase(); }
    getNumUsed():number                                     { return this.num_used; }
    getMaxCoupons():number                                  { return this.max_coupons; }
    getDiscountAmount():number                              { return this.discount_amount; }
    getDiscountUnit():number                                { return this.discount_unit; }
    getExpiryTime():number                                  { return this.expiry_time; }
    getWaiveNetworkCharges():boolean                        { return this.waive_network_charges; }
    getIntegrationId():number                               { return this.integration_id; }
    getExpertId():number                                    { return this.expert_id; }
    getExpert():IntegrationMember                           { return this.expert; }

    /* Setters */
    setCode(val:string):void                                { this.code = val.toUpperCase(); }
    setNumUsed(val:number):void                             { this.num_used = val; }
    setMaxCoupons(val:number):void                          { this.max_coupons = val; }
    setDiscountAmount(val:number):void                      { this.discount_amount = val; }
    setDiscountUnit(val:number):void                        { this.discount_unit = val; }
    setExpiryTime(val:number):void                          { this.expiry_time = val; }
    setWaiveNetworkCharges(val:boolean):void                { this.waive_network_charges = val; }
    setIntegrationId(val:number):void                       { this.integration_id = val; }
    setExpertId(val:number):void                            { this.expert_id = val; }
    setExpert(val:IntegrationMember):void                   { this.expert = val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getCode()) && !Utils.isNullOrEmpty(this.getIntegrationId());
    }
}
export = Coupon