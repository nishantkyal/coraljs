import ApiUrlDelegate                           = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static login():string                       { return '/login'; }
    static register():string                    { return '/register'; }
    static fbLogin():string                     { return '/login/fb'; }
    static linkedInLogin():string               { return '/login/linkedin'; }
    static fbLoginCallBack():string             { return '/login/fb/callback'; }
    static linkedinLoginCallBack():string       { return '/login/linkedin/callback'; }
}
export = Urls