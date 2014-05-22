///<reference path='../_references.d.ts'/>
import url                                                  = require('url');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import Config                                               = require('../common/Config');

class TwilioUrlDelegate
{
    static twimlGenerateCall(callId?:number):string { return ApiUrlDelegate.get('/rest/twiml/calling/:callId', {callId: callId}, Config.get(Config.DASHBOARD_URI)); }
    static twimlJoinCall(callId?:number):string { return ApiUrlDelegate.get('/rest/twiml/join/:callId', {callId: callId}, Config.get(Config.DASHBOARD_URI)); }
    static twimlCallback(callId?:number):string { return ApiUrlDelegate.get('/rest/twiml/callback/:callId', {callId: callId}, Config.get(Config.DASHBOARD_URI)); }
}
export = TwilioUrlDelegate