import ApiUrlDelegate                                      = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static index():string { return ApiUrlDelegate.get('/expert/registration'); }
    static login():string { return ApiUrlDelegate.get('/expert/login'); }
    static register():string { return ApiUrlDelegate.get('/expert/register'); }
    static linkedInLogin():string { return ApiUrlDelegate.get('/expert/login/linkedin'); }
    static linkedInLoginCallback():string { return ApiUrlDelegate.get('/expert/login/linkedin/callback'); }
    static authorization():string { return ApiUrlDelegate.get('/expert/authorization'); }
    static authorizationDecision():string { return ApiUrlDelegate.get('/expert/authorization/decision'); }
    static mobileVerification():string { return ApiUrlDelegate.get('/expert/registration/mobile/verification'); }
    static profile():string { return ApiUrlDelegate.get('/expert/registration/profile'); }
    static complete():string { return ApiUrlDelegate.get('/expert/registration/complete'); }
}
export = Urls