import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/expert/:expertId(\\d+)/call', {expertId: expertId}, baseUrl); }
    static schedule():string { return '/expert/call/schedule'; }
    static applyCoupon():string { return '/expert/call/payment/coupon'; }
    static callPayment():string { return '/expert/call/payment'; }
    static checkout():string { return '/expert/call/checkout'; }
    static login():string { return '/expert/call/login'; }
    static register():string { return '/expert/call/register'; }

}
export = Urls