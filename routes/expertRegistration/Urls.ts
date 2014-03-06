import ApiUrlDelegate                                      = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static index():string { return ApiUrlDelegate.get('/expert/registration'); }
    static authorization():string { return ApiUrlDelegate.get('/expert/authorization'); }
    static authorizationDecision():string { return ApiUrlDelegate.get('/expert/authorization/decision'); }
    static complete():string { return ApiUrlDelegate.get('/expert/registration/complete'); }
    static login():string { return ApiUrlDelegate.get('/expert/login'); }
    static register():string { return ApiUrlDelegate.get('/expert/register'); }
    static linkedInLogin():string { return ApiUrlDelegate.get('/expert/login/linkedin'); }
    static linkedInLoginCallback():string { return ApiUrlDelegate.get('/expert/login/linkedin/callback'); }
}
export = Urls