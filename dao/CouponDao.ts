///<reference path='../_references.d.ts'/>
import AbstractDao                                  = require('./AbstractDao');
import BaseModel                                    = require('../models/BaseModel');
import Coupon                                       = require('../models/Coupon');

class CouponDao extends AbstractDao
{
    constructor() { super(Coupon); }
}
export = CouponDao