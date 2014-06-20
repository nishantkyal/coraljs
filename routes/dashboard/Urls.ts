import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static checkLogin() { return '/checkLogin'; }
    static login() { return '/login'; }
    static register() { return '/register'; }
    static linkedInLogin() { return '/login/linkedin'; }
    static linkedInLoginCallback() { return '/login/linkedin/callback'; }
    static forgotPassword() { return '/forgotPassword'; }
    static emailAccountVerification() { return '/email/verification'; }
    static mobileVerification():string { return '/phone/verification'; }

    static index() { return '/'; }
    static dashboard() { return '/dashboard'; }
    static integration() { return '/network'; }
    static userProfile(userId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/user/:userId(\\d+)/profile', {userId: userId}, baseUrl); }
    static userSetting(userId?:number) { return ApiUrlDelegate.get('/user/:userId(\\d+)/setting', {userId: userId}); }

    static logout() { return '/logout'; }

    static userProfileFromLinkedIn(profileId?:number):string { return ApiUrlDelegate.get('/member/profileFromLinkedIn/:profileId(\\d+)', {profileId: profileId}); }
    static userProfileFromLinkedInCallback():string { return '/member/profileFromLinkedInCallback'; }
}
export = Urls;