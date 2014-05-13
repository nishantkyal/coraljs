import ApiUrlDelegate                                      = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static index():string { return ApiUrlDelegate.get('/member/registration'); }
    static login():string { return ApiUrlDelegate.get('/member/login'); }
    static register():string { return ApiUrlDelegate.get('/member/register'); }
    static linkedInLogin():string { return ApiUrlDelegate.get('/member/login/linkedin'); }
    static linkedInLoginCallback():string { return ApiUrlDelegate.get('/member/login/linkedin/callback'); }
    static authorization():string { return ApiUrlDelegate.get('/member/authorization'); }
    static authorizationDecision():string { return ApiUrlDelegate.get('/member/authorization/decision'); }
    static authorizationRedirect():string { return ApiUrlDelegate.get('/member/authorization/redirect'); }
    static complete():string { return ApiUrlDelegate.get('/member/registration/complete'); }
}
export = Urls