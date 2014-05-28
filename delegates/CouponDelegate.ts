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
import IncludeFlag                                          = require('../enums/IncludeFlag');
import Utils                                                = require('../common/Utils');

class CouponDelegate extends BaseDaoDelegate
{
    userDelegate = new UserDelegate();
    integrationMemberDelegate = new IntegrationMemberDelegate();

    constructor() { super(new CouponDao()); }

    create(object:Object, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(object[Coupon.EXPIRY_TIME]))
            object[Coupon.EXPIRY_TIME] = moment().year(2050).month(12).date(31).valueOf();

        if (Utils.isNullOrEmpty(object[Coupon.MAX_COUPONS]))
            object[Coupon.MAX_COUPONS] = 99999999;

        return super.create(object, transaction);
    }

    findCoupon(code:string, fields?:string[], includeExpiredAndExhausted:boolean = false):q.Promise<Coupon>
    {
        var search = {};
        search[Coupon.CODE] = code;

        if (!includeExpiredAndExhausted)
        {
            search[Coupon.NUM_USED] = {
                raw: ' <= ' + Coupon.MAX_COUPONS
            };

            search[Coupon.EXPIRY_TIME] = {
                operator: '>',
                value: moment().valueOf()
            };
        }

        return this.find(search, fields);
    }

    markUsed(criteria:number[], transaction?:Object):q.Promise<any>;
    markUsed(criteria:string[], transaction?:Object):q.Promise<any>;
    markUsed(criteria:number, transaction?:Object):q.Promise<any>;
    markUsed(criteria:string, transaction?:Object):q.Promise<any>;
    markUsed(criteria:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        criteria = [].concat(criteria);
        self.update
        var criteriaField = Utils.getObjectType(criteria[0]) == 'String' ? Coupon.CODE : Coupon.ID;
        criteria = Utils.createSimpleObject(criteriaField, criteria);
        return self.update(criteria, Utils.createSimpleObject(Coupon.NUM_USED, Coupon.NUM_USED + ' + 1'), transaction);
    }

    markRemoved(criteria:number[], transaction?:Object):q.Promise<any>;
    markRemoved(criteria:string[], transaction?:Object):q.Promise<any>;
    markRemoved(criteria:number, transaction?:Object):q.Promise<any>;
    markRemoved(criteria:string, transaction?:Object):q.Promise<any>;
    markRemoved(criteria:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        criteria = [].concat(criteria);

        var criteriaField = Utils.getObjectType(criteria[0]) == 'String' ? Coupon.CODE : Coupon.ID;
        criteria = Utils.createSimpleObject(criteriaField, criteria);

        return self.update(criteria, Utils.createSimpleObject(Coupon.NUM_USED, Coupon.NUM_USED + ' - 1'), transaction);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var coupon:Coupon = result;
        var self = this;

        switch (include)
        {
            case IncludeFlag.INCLUDE_EXPERT:
                var expertIds = _.pluck(_.filter(coupon, function (c:Coupon)
                {
                    return !Utils.isNullOrEmpty(c.getExpertResourceId());
                }), Coupon.EXPERT_RESOURCE_ID);

                if (expertIds.length != 0)
                    return self.integrationMemberDelegate.search({id: expertIds}, IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]);
                else
                    return null;
        }
        return super.getIncludeHandler(include, result);
    }
}
export = CouponDelegate