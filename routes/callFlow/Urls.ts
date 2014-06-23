import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(userId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/expert/:userId(\\d+)/call', {userId: userId}, baseUrl); }
    static scheduling(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}, baseUrl); }
}
export = Urls