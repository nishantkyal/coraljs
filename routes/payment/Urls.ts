import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static payment():string { return '/payment'; }
    static checkout():string { return '/checkout'; }
    static coupon():string { return '/payment/coupon'; }
    static removeCoupon():string { return '/payment/coupon'; }
    static paymentCallback() { return '/payment/complete'; }
}
export = Urls