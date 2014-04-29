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
    static scheduling(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}); }
    static rescheduleByExpert(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/rescheduleByExpert', {callId: callId}); }
    static rescheduleByUser(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/rescheduleByUser', {callId: callId}); }
    static reject(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/reject', {callId: callId}); }
}
export = Urls