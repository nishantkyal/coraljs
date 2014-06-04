import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static scheduling(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}, baseUrl); }
}
export = Urls