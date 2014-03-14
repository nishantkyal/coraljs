///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                              = require('../delegates/BaseDaoDelegate');
import IDao                                         = require('../dao/IDao');
import CouponDao                                    = require('../dao/CouponDao');

class CouponDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new CouponDao(); }
}
export = CouponDelegate