import ApiUrlDelegate                           = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static checkLogin()                         { return '/checkLogin'; }
    static login()                              { return '/login'; }
    static register()                           { return '/register'; }
    static fbLogin():string                     { return '/login/fb'; }
    static fbLoginCallBack():string             { return '/login/fb/callback'; }
    static linkedInLogin():string               { return '/login/linkedin'; }
    static linkedInLoginCallBack():string       { return '/login/linkedin/callback'; }
    static logout()                             { return '/logout'; }

}
export = Urls