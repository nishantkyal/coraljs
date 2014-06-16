///<reference path='../_references.d.ts'/>
import BaseModel                                                = require('../models/BaseModel');
import IntegrationMember                                        = require('../models/IntegrationMember');
import MoneyUnit                                                = require('../enums/MoneyUnit');
import CouponType                                               = require('../enums/CouponType');
import Utils                                                    = require('../common/Utils');

class Coupon extends BaseModel
{
    static TABLE_NAME:string = 'coupon';

    static CODE:string                      = 'code';
    static NUM_USED:string                  = 'num_used';
    static MAX_COUPONS:string               = 'max_coupons';
    static COUPON_TYPE:string               = 'coupon_type';
    static DISCOUNT_AMOUNT:string           = 'discount_amount';
    static DISCOUNT_UNIT:string             = 'discount_unit';
    static EXPIRY_TIME:string               = 'expiry_time';
    static INTEGRATION_ID:string            = 'integration_id';
    static EXPERT_RESOURCE_ID:string        = 'expert_resource_id';

    static DEFAULT_FIELDS = [Coupon.ID, Coupon.CODE];
    static DASHBOARD_FIELDS = [Coupon.ID, Coupon.CODE, Coupon.EXPERT_RESOURCE_ID, Coupon.COUPON_TYPE, Coupon.DISCOUNT_AMOUNT, Coupon.DISCOUNT_UNIT, Coupon.EXPIRY_TIME, Coupon.MAX_COUPONS, Coupon.NUM_USED, Coupon.INTEGRATION_ID];

    private code:string;
    private num_used:number;
    private max_coupons:number;
    private coupon_type:CouponType;
    private discount_amount:number;
    private discount_unit:MoneyUnit;
    private expiry_time:number;
    private integration_id:number;
    private expert_resource_id:number;

    private expert:IntegrationMember;

    /* Getters */
    getCode():string                                        { return this.code.toUpperCase(); }
    getNumUsed():number                                     { return this.num_used; }
    getMaxCoupons():number                                  { return this.max_coupons; }
    getCouponType():CouponType                              { return this.coupon_type; }
    getDiscountAmount():number                              { return this.discount_amount; }
    getDiscountUnit():number                                { return this.discount_unit; }
    getExpiryTime():number                                  { return this.expiry_time; }
    getIntegrationId():number                               { return this.integration_id; }
    getExpertResourceId():number                            { return this.expert_resource_id; }

    getExpert():IntegrationMember                           { return this.expert; }

    /* Setters */
    setCode(val:string):void                                { this.code = val.toUpperCase(); }
    setNumUsed(val:number):void                             { this.num_used = val; }
    setMaxCoupons(val:number):void                          { this.max_coupons = val; }
    setCouponType(val:CouponType):void                      { this.coupon_type = val; }
    setDiscountAmount(val:number):void                      { this.discount_amount = val; }
    setDiscountUnit(val:number):void                        { this.discount_unit = val; }
    setExpiryTime(val:number):void                          { this.expiry_time = val; }
    setIntegrationId(val:number):void                       { this.integration_id = val; }
    setExpertResourceId(val:number):void                    { this.expert_resource_id = val; }

    setExpert(val:IntegrationMember):void                   { this.expert = val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getCode()) && !Utils.isNullOrEmpty(this.getIntegrationId());
    }
}
export = Coupon