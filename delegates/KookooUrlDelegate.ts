import url                                      = require('url');
import ApiUrlDelegate                           = require('../delegates/ApiUrlDelegate');

class KookooUrlDelegate
{
    static kookooCallback():string { return ApiUrlDelegate.get('/rest/call/kookoo'); }
}
export = KookooUrlDelegate