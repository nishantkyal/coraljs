import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/expert/:expertId(\\d+)/call', {expertId: expertId}, baseUrl); }
    static schedule():string { return '/expert/call/schedule'; }
    static applyCoupon():string { return '/expert/call/payment/coupon'; }
    static callPayment():string { return '/expert/call/payment'; }
    static checkout():string { return '/expert/call/checkout'; }
    static removeCoupon():string { return '/expert/call/payment/removeCoupon'; }

    static linkedInLogin():string { return '/expert/call/login/linkedin'; }
    static linkedInLoginCallback():string { return '/expert/call/login/linkedin/callback'; }
}
export = Urls