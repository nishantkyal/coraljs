///<reference path='../_references.d.ts'/>
import url                                                  = require('url');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import Config                                               = require('../common/Config');

class TwilioUrlDelegate
{
    static twimlGenerateCall(callId?:number):string { return ApiUrlDelegate.get('/rest/twiml/calling/:callId', {callId: callId}, Config.get(Config.TWILIO_URI)); }
    static twimlJoinCall(callId?:number):string { return ApiUrlDelegate.get('/rest/twiml/join/:callId', {callId: callId}, Config.get(Config.TWILIO_URI)); }
    static twimlCallback(callId?:number):string { return ApiUrlDelegate.get('/rest/twiml/callback/:callId', {callId: callId}, Config.get(Config.TWILIO_URI)); }
    static twimlCall(callId ?:number):string { return ApiUrlDelegate.get('/rest/twiml/call/:callId(\\d+)', {callId: callId}); }
    static twimlCallExpert(callId ?:number):string { return ApiUrlDelegate.get('/rest/twiml/call/:callId(\\d+)/expert', {callId: callId}); }
    static twimlJoinConference():string { return ApiUrlDelegate.get('/rest/twiml/call'); }
    static twiml():string { return ApiUrlDelegate.get('/rest/twiml'); }
}

export = TwilioUrlDelegate