///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import mysql                                        = require('mysql');
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
        var criteriaString= Utils.getObjectType(criteria) == 'String' ? Coupon.COL_CODE + ' = \'' + criteria + '\'' : Coupon.COL_ID + ' = ' + criteria;

        var query = 'UPDATE `coupon` SET num_used = num_used + 1 WHERE ' + criteriaString + ' AND max_coupons > num_used;' ;
        return MysqlDelegate.executeQuery(query, null, transaction)
            .then(
            function updateComplete(result:mysql.OkPacket):any
            {
                if (result.affectedRows == 0)
                {
                    return q.reject('Invalid or Used Coupon');
                }
                else
                    return q.resolve(result);
            },
            function updateError(error)
            {
                return q.reject('UPDATE failed, error: ' + JSON.stringify(error));
            });
    }

    decrementCouponUsedCount(criteria:any,transaction?:Object):q.Promise<any>
    {
        var criteriaString= Utils.getObjectType(criteria) == 'String' ? Coupon.COL_CODE + ' = \'' + criteria + '\'' : Coupon.COL_ID + ' = ' + criteria;

        var query = 'UPDATE `coupon` SET num_used = num_used - 1 WHERE ' + criteriaString + ' AND num_used - 1 >= 0;' ;
        return MysqlDelegate.executeQuery(query, null, transaction)
            .then(
            function updateComplete(result:mysql.OkPacket):any
            {
                if (result.affectedRows == 0)
                {
                    return q.reject('No rows were updated');
                }
                else
                    return q.resolve(result);
            },
            function updateError(error)
            {
                return q.reject('UPDATE failed, error: ' + JSON.stringify(error));
            });
    }
}
export = CouponDao