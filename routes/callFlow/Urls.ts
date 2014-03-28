import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number):string { return ApiUrlDelegate.get('/expert/:expertId(\\d+)/call', {expertId: expertId}); }
    static userLogin():string { return ApiUrlDelegate.get('/call/login'); }
    static userRegister():string { return ApiUrlDelegate.get('/call/register'); }
    static userFBLogin():string { return ApiUrlDelegate.get('/call/login/fb'); }
    static userFBLoginCallback():string { return ApiUrlDelegate.get('/call/login/fb/callback'); }
    static paymentCallback() { return ApiUrlDelegate.get('/payment/complete'); }
    static scheduling(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}); }
}
export = Urls