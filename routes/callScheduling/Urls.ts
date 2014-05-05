import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static scheduling(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}); }
    static rescheduleByExpert(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/rescheduleByExpert', {callId: callId}); }
    static rescheduleByUser(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/rescheduleByUser', {callId: callId}); }
    static reject(callId?:number) { return ApiUrlDelegate.get('/call/:callId(\\d+)/reject', {callId: callId}); }
}
export = Urls