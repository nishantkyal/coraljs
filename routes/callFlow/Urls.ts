import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/expert/:expertId(\\d+)/call', {expertId: expertId}, baseUrl); }
    static login():string { return ApiUrlDelegate.get('/call/login'); }
    static register():string { return ApiUrlDelegate.get('/call/register'); }
    static fbLogin():string { return ApiUrlDelegate.get('/call/login/fb'); }
    static fbLoginCallback():string { return ApiUrlDelegate.get('/call/login/fb/callback'); }
    static applyCoupon():string { return ApiUrlDelegate.get('/expert/call/payment/coupon'); }
    static callPayment():string { return ApiUrlDelegate.get('/expert/call/payment'); }
}
export = Urls