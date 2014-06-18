import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(expertId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/expert/:expertId(\\d+)/call', {expertId: expertId}, baseUrl); }
    static schedule():string { return '/expert/call/schedule'; }

    static linkedInLogin():string { return '/expert/call/login/linkedin'; }
    static linkedInLoginCallback():string { return '/expert/call/login/linkedin/callback'; }

    static facebookLogin():string { return '/expert/call/login/facebook'; }
    static facebookLoginCallback():string { return '/expert/call/login/facebook/callback'; }
}
export = Urls