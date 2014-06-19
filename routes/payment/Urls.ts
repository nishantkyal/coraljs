import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static payment():string { return '/payment'; }
    static checkout():string { return '/checkout'; }
    static coupon():string { return '/payment/coupon'; }
    static removeCoupon():string { return '/payment/coupon'; }
    static paymentCallback() { return '/payment/complete'; }

    static linkedInLogin():string { return '/expert/call/login/linkedin'; }
    static linkedInLoginCallback():string { return '/expert/call/login/linkedin/callback'; }

    static facebookLogin():string { return '/expert/call/login/facebook'; }
    static facebookLoginCallback():string { return '/expert/call/login/facebook/callback'; }
}
export = Urls