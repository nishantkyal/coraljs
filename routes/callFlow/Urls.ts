import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number):string { return ApiUrlDelegate.get('/expert/:expertId(\\d+)/call', {expertId: expertId}); }
    static login():string { return ApiUrlDelegate.get('/call/login'); }
    static register():string { return ApiUrlDelegate.get('/call/register'); }
    static fbLogin():string { return ApiUrlDelegate.get('/call/login/fb'); }
    static fbLoginCallback():string { return ApiUrlDelegate.get('/call/login/fb/callback'); }
    static callPayment():string { return ApiUrlDelegate.get('/expert/call/payment'); }
    static scheduling(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}); }
    static reschedule(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/reschedule', {callId: callId}); }
    static reject(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/reject', {callId: callId}); }
}
export = Urls