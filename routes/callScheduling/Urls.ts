import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static scheduling(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}, baseUrl); }
    static suggestTimeSlot(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling/suggest', {callId: callId}, baseUrl); }
    static pickTimeSlot(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling/pick', {callId: callId}, baseUrl); }
    static reject(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling/reject', {callId: callId}, baseUrl); }
}
export = Urls