import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static scheduling(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}, baseUrl); }
    static rescheduleByExpert(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/rescheduleByExpert', {callId: callId}, baseUrl); }
    static rescheduleByUser(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/rescheduleByUser', {callId: callId}, baseUrl); }
    static reject(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/reject', {callId: callId}, baseUrl); }
}
export = Urls