///<reference path='../_references.d.ts'/>
import _                                                    = require('underscore');
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('../delegates/BaseDaoDelegate');
import UserDelegate                                         = require('../delegates/UserDelegate');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import IDao                                                 = require('../dao/IDao');
import CouponDao                                            = require('../dao/CouponDao');
import Coupon                                               = require('../models/Coupon');
import IntegrationMember                                    = require('../models/IntegrationMember');
import IncludeFlag                                          = require('../enums/IncludeFlag');
import Utils                                                = require('../common/Utils');

class CouponDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS = [Coupon.ID, Coupon.CODE];
    DASHBOARD_FIELDS = [Coupon.ID, Coupon.CODE, Coupon.EXPERT_ID, Coupon.DISCOUNT_AMOUNT, Coupon.DISCOUNT_UNIT, Coupon.EXPIRY_TIME, Coupon.MAX_COUPONS, Coupon.NUM_USED, Coupon.INTEGRATION_ID, Coupon.WAIVE_NETWORK_CHARGES];

    userDelegate = new UserDelegate();
    integrationMemberDelegate = new IntegrationMemberDelegate();

    constructor() { super(new CouponDao()); }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var coupon:Coupon = result;
        var self = this;

        switch (include)
        {
            case IncludeFlag.INCLUDE_EXPERT:
                var expertIds = _.pluck(_.filter(coupon, function (c:Coupon)
                {
                    return !Utils.isNullOrEmpty(c.getExpertId());
                }), Coupon.EXPERT_ID);

                if (expertIds.length != 0)
                    return self.integrationMemberDelegate.search({id: expertIds}, self.integrationMemberDelegate.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]);
                else
                    return null;
        }
        return super.getIncludeHandler(include, result);
    }
}
export = CouponDelegate