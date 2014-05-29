///<reference path='../_references.d.ts'/>
import url                                                  = require('url');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import Config                                               = require('../common/Config');

class TwilioUrlDelegate
{
    static twimlGenerateCall(callId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/rest/twiml/calling/:callId', {callId: callId}, baseUrl); }
    static twimlJoinCall(callId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/rest/twiml/join/:callId', {callId: callId}, baseUrl); }
    static twimlCallback(callId?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/rest/twiml/callback/:callId', {callId: callId}, baseUrl); }
    static twimlCall(callId ?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/rest/twiml/call/:callId(\\d+)', {callId: callId}, baseUrl); }
    static twimlCallExpert(callId ?:number, baseUrl?:string):string { return ApiUrlDelegate.get('/rest/twiml/call/:callId(\\d+)/expert', {callId: callId}, baseUrl); }
    static twimlJoinConference(baseUrl?:string):string { return ApiUrlDelegate.get('/rest/twiml/call',null, baseUrl); }
    static twiml(baseUrl?:string):string { return ApiUrlDelegate.get('/rest/twiml', null, baseUrl); }
}

export = TwilioUrlDelegate