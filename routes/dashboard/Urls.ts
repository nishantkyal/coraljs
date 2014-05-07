import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static index() { return ApiUrlDelegate.get('/'); }
    static login() { return ApiUrlDelegate.get('/login'); }
    static forgotPassword() { return ApiUrlDelegate.get('/forgotPassword'); }
    static changePassword(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/changePassword', {memberId: memberId}); }
    static changeProfileStatus(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/changeProfileStatus', {memberId: memberId}); }
    static publishProfile(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/publishProfile', {memberId: memberId}); }
    static emailAccountVerification() { return ApiUrlDelegate.get('/email/verification'); }
    static mobileVerification():string { return ApiUrlDelegate.get('/phone/verification'); }
    static integrations() { return ApiUrlDelegate.get('/integrations'); }
    static integrationCoupons(integrationId?:number) { return ApiUrlDelegate.get('/integration/:integrationId(\\d+)/coupons', {integrationId: integrationId}); }
    static integrationMembers(integrationId?:number) { return ApiUrlDelegate.get('/integration/:integrationId(\\d+)/members', {integrationId: integrationId}); }
    static memberProfile(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/profile', {memberId: memberId}); }
    static logout() { return ApiUrlDelegate.get('/logout'); }
    static paymentCallback() { return ApiUrlDelegate.get('/payment/complete'); }
    static userProfileFromLinkedIn(profileId?:number):string { return ApiUrlDelegate.get('/member/profileFromLinkedIn/:profileId(\\d+)', {profileId: profileId}); }
    static userProfileFromLinkedInCallback():string { return ApiUrlDelegate.get('/member/profileFromLinkedInCallback'); }
}
export = Urls;