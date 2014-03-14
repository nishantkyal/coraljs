import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number):string { return ApiUrlDelegate.get('/expert/:expertId/call', {expertId: expertId}); }
    static userLogin():string { return ApiUrlDelegate.get('/call/login'); }
    static userRegister():string { return ApiUrlDelegate.get('/call/register'); }
    static userFBLogin():string { return ApiUrlDelegate.get('/call/login/fb'); }
    static userFBLoginCallback():string { return ApiUrlDelegate.get('/call/login/fb/callback'); }
    static callDetails():string { return ApiUrlDelegate.get('/call/details'); }
    static checkout():string { return ApiUrlDelegate.get('/call/checkout'); }
}
export = Urls