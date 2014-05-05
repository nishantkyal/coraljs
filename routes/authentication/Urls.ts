import ApiUrlDelegate                           = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static login():string { return ApiUrlDelegate.get('/login'); }
    static register():string { return ApiUrlDelegate.get('/register'); }
    static fbLogin():string { return ApiUrlDelegate.get('/login/fb'); }
    static linkedinLogin():string { return ApiUrlDelegate.get('/login/linkedin'); }
    static fbLoginCallBack():string { return ApiUrlDelegate.get('/login/fb/callback'); }
    static linkedinLoginCallBack():string { return ApiUrlDelegate.get('/login/linkedin/callback'); }
}
export = Urls