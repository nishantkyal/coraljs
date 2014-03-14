///<reference path='../_references.d.ts'/>
import BaseDao                                      = require('../dao/BaseDao');
import BaseModel                                    = require('../models/BaseModel');
import Coupon                                       = require('../models/Coupon');

class CouponDao extends BaseDao
{
    getModel():typeof BaseModel { return Coupon; }
}
export = CouponDao