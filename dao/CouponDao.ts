///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import AbstractDao                                  = require('./AbstractDao');
import BaseModel                                    = require('../models/BaseModel');
import Coupon                                       = require('../models/Coupon');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');
import Utils                                        = require('../common/Utils');

class CouponDao extends AbstractDao
{
    constructor() { super(Coupon); }

    incrementCouponUsedCount(criteria:any,transaction?:Object):q.Promise<any>
    {
        var criteriaString= Utils.getObjectType(criteria) == 'String' ? Coupon.CODE : Coupon.ID;
        criteriaString += ' = ' + criteria;

        var query = 'UPDATE `coupon` SET num_used = num_used + 1 WHERE ' + criteriaString + ' AND max_coupons > num_used;' ;
        return MysqlDelegate.executeQuery(query, null, transaction);
    }

    decrementCouponUsedCount(criteria:any,transaction?:Object):q.Promise<any>
    {
        var criteriaString= Utils.getObjectType(criteria) == 'String' ? Coupon.CODE : Coupon.ID;
        criteriaString += ' = ' + criteria;

        var query = 'UPDATE `coupon` SET num_used = num_used - 1 WHERE ' + criteriaString + ' AND num_used - 1 >= 0;' ;
        return MysqlDelegate.executeQuery(query, null, transaction);
    }
}
export = CouponDao