import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static index() { return ApiUrlDelegate.get('/'); }
    static login() { return ApiUrlDelegate.get('/login'); }
    static mobileVerification():string { return ApiUrlDelegate.get('/userPhone/verification'); }
    static integrations() { return ApiUrlDelegate.get('/integrations'); }
    static integrationCoupons(integrationId?:number) { return ApiUrlDelegate.get('/integration/:integrationId(\\d+)/coupons', {integrationId: integrationId}); }
    static integrationMembers(integrationId?:number) { return ApiUrlDelegate.get('/integration/:integrationId(\\d+)/members', {integrationId: integrationId}); }
    static memberProfile(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/profile', {memberId: memberId}); }
    static logout() { return ApiUrlDelegate.get('/logout'); }
    static paymentCallback() { return ApiUrlDelegate.get('/payment/complete'); }
}
export = Urls;