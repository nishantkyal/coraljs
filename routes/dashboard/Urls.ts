import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static index() { return ApiUrlDelegate.get('/'); }
    static login() { return ApiUrlDelegate.get('/login'); }
    static emailAccountVerification() { return ApiUrlDelegate.get('/email/verification'); }
    static mobileVerification():string { return ApiUrlDelegate.get('/phone/verification'); }
    static integrations() { return ApiUrlDelegate.get('/integrations'); }
    static integrationCoupons(integrationId?:number) { return ApiUrlDelegate.get('/integration/:integrationId(\\d+)/coupons', {integrationId: integrationId}); }
    static integrationMembers(integrationId?:number) { return ApiUrlDelegate.get('/integration/:integrationId(\\d+)/members', {integrationId: integrationId}); }
    static memberProfile(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/profile', {memberId: memberId}); }
    static memberProfileComplete(memberId?:number){ return ApiUrlDelegate.get('/member/:memberId(\\d+)/profileComplete', {memberId: memberId}); }
    static memberEducation(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/education', {memberId: memberId}); }
    static memberEducationById(educationId?:number) { return ApiUrlDelegate.get('/member/education/:educationId(\\d+)', { educationId:educationId }); }
    static memberSkill(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/skill', {memberId: memberId}); }
    static memberEmployment(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/employment', {memberId: memberId}); }
    static logout() { return ApiUrlDelegate.get('/logout'); }
    static paymentCallback() { return ApiUrlDelegate.get('/payment/complete'); }
}
export = Urls;