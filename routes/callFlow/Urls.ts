import ApiUrlDelegate                                       = require('../../delegates/ApiUrlDelegate');

class Urls
{
    static callExpert(userId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/expert/:userId(\\d+)/call', {userId: userId}, baseUrl); }
    static scheduling(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/scheduling', {callId: callId}, baseUrl); }
    static review(callId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/:callId(\\d+)/review', {callId: callId}, baseUrl); }
    static reviewById(reviewId?:number, baseUrl?:string) { return ApiUrlDelegate.get('/call/review/:reviewId(\\d+)', {reviewId: reviewId}, baseUrl); }
}
export = Urls