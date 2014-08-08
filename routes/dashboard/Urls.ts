import ApiUrlDelegate                                                   = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static forgotPassword()                                             { return '/forgotPassword'; }
    static emailAccountVerification()                                   { return '/email/verification'; }
    static mobileVerification():string                                  { return '/phone/verification'; }

    static index()                                                      { return '/'; }
    static home()                                                       { return '/home'; }
    static dashboard()                                                  { return '/dashboard'; }
    static networkProfile(networkId?:number, baseUrl?:string)           { return ApiUrlDelegate.get('/network/:networkId(\\d+)', {networkId: networkId}, baseUrl); }
    static payments()                                                   { return '/payments'; }
    static integration(baseUrl?:string)                                 { return ApiUrlDelegate.get('/network', null, baseUrl); }
    static userProfile(userId?:number, baseUrl?:string)                 { return ApiUrlDelegate.get('/user/:userId(\\d+)/profile', {userId: userId}, baseUrl); }
    static userSettingPhone(userId?:number)                             { return ApiUrlDelegate.get('/user/:userId(\\d+)/setting/phones', {userId: userId}); }
    static userSettingSchedule(userId?:number)                          { return ApiUrlDelegate.get('/user/:userId(\\d+)/setting/schedule', {userId: userId}); }
    static userSettingPassword(userId?:number)                          { return ApiUrlDelegate.get('/user/:userId(\\d+)/setting/password', {userId: userId}); }
    static widgetCreator()                                              { return '/widgetCreator';}
}
export = Urls;