///<reference path='../_references.d.ts'/>
import _                                                    = require('underscore');
import q                                                    = require('q');
import moment                                               = require('moment');
import BaseDaoDelegate                                      = require('../delegates/BaseDaoDelegate');
import UserDelegate                                         = require('../delegates/UserDelegate');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import CouponDao                                            = require('../dao/CouponDao');
import Coupon                                               = require('../models/Coupon');
import IntegrationMember                                    = require('../models/IntegrationMember');
import Utils                                                = require('../common/Utils');

class CouponDelegate extends BaseDaoDelegate
{
    userDelegate = new UserDelegate();
    integrationMemberDelegate = new IntegrationMemberDelegate();

    constructor() { super(new CouponDao()); }

    create(object:Object, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(object[Coupon.COL_EXPIRY_TIME]))
            object[Coupon.COL_EXPIRY_TIME] = moment().year(2050).month(12).date(31).valueOf();

        if (Utils.isNullOrEmpty(object[Coupon.COL_MAX_COUPONS]))
            object[Coupon.COL_MAX_COUPONS] = 99999999;

        return super.create(object, transaction);
    }

    findCoupon(code:string, fields?:string[], includeExpiredAndExhausted:boolean = false):q.Promise<Coupon>
    {
        var search = {};
        search[Coupon.COL_CODE] = code;

        if (!includeExpiredAndExhausted)
        {
            search[Coupon.COL_NUM_USED] = {
                raw: ' <= ' + Coupon.COL_MAX_COUPONS
            };

            search[Coupon.COL_EXPIRY_TIME] = {
                operator: '>',
                value: moment().valueOf()
            };
        }

        return this.find(search, fields);
    }

    markUsed(criteria:number, transaction?:Object):q.Promise<any>;
    markUsed(criteria:string, transaction?:Object):q.Promise<any>;
    markUsed(criteria:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var couponDao:any = self.dao;
        return couponDao.incrementCouponUsedCount(criteria, transaction);
    }

    markRemoved(criteria:number, transaction?:Object):q.Promise<any>;
    markRemoved(criteria:string, transaction?:Object):q.Promise<any>;
    markRemoved(criteria:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var couponDao:any = self.dao;
        return couponDao.decrementCouponUsedCount(criteria, transaction);
    }
}
export = CouponDelegate