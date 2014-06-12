import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static index() { return ApiUrlDelegate.get('/'); }
    static login() { return ApiUrlDelegate.get('/login'); }
    static register() { return ApiUrlDelegate.get('/register'); }
    static linkedInLogin() { return ApiUrlDelegate.get('/login/linkedin'); }
    static linkedInLoginCallback() { return ApiUrlDelegate.get('/login/linkedin/callback'); }
    static forgotPassword() { return ApiUrlDelegate.get('/forgotPassword'); }
    static changePassword(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/changePassword', {memberId: memberId}); }
    static callDetails(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/callDetails', {memberId: memberId}); }
    static revenueDetails(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/revenueDetails', {memberId: memberId}); }
    static scheduleDetails(memberId?:number) { return ApiUrlDelegate.get('/member/:memberId(\\d+)/schedule', {memberId: memberId}); }
    static emailAccountVerification() { return ApiUrlDelegate.get('/email/verification'); }
    static mobileVerification():string { return ApiUrlDelegate.get('/phone/verification'); }

    static dashboard() { return ApiUrlDelegate.get('/dashboard'); }
    static integration() { return ApiUrlDelegate.get('/network'); }
    static userProfile(userId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/user/:userId(\\d+)/profile', {userId: userId}, baseUrl); }

    static logout() { return ApiUrlDelegate.get('/logout'); }
    static paymentCallback() { return ApiUrlDelegate.get('/payment/complete'); }
    static userProfileFromLinkedIn(profileId?:number):string { return ApiUrlDelegate.get('/member/profileFromLinkedIn/:profileId(\\d+)', {profileId: profileId}); }
    static userProfileFromLinkedInCallback():string { return ApiUrlDelegate.get('/member/profileFromLinkedInCallback'); }
}
export = Urls;