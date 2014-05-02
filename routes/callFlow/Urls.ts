import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/expert/:expertId(\\d+)/call', {expertId: expertId}, baseUrl); }
    static schedule():string { return ApiUrlDelegate.get('/expert/call/schedule'); }
    static applyCoupon():string { return ApiUrlDelegate.get('/expert/call/payment/coupon'); }
    static callPayment():string { return ApiUrlDelegate.get('/expert/call/payment'); }
}
export = Urls