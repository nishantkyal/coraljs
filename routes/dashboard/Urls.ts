import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static forgotPassword()                                 { return '/forgotPassword'; }
    static emailAccountVerification()                       { return '/email/verification'; }
    static mobileVerification():string                      { return '/phone/verification'; }

    static index()                                          { return '/'; }
    static dashboard()                                      { return '/dashboard'; }
    static integration(baseUrl?:string)                     { return ApiUrlDelegate.get('/network', null, baseUrl); }
    static userProfile(userId?:number, baseUrl?:string)     { return ApiUrlDelegate.get('/user/:userId(\\d+)/profile', {userId: userId}, baseUrl); }
    static userSetting(userId?:number)                      { return ApiUrlDelegate.get('/user/:userId(\\d+)/setting', {userId: userId}); }
}
export = Urls;