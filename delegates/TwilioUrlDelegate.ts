import url                                      = require('url');

class TwilioUrlDelegate
{
    static BASE_URL:string = '';
    static INFOLLION_URL:string = 'http://www.infollion.com:2021';

    static twimlGenerateCall(callId?:number):string { return this.get('/rest/twiml/calling/:callId', {callId: callId}); }
    static twimlJoinCall(callId?:number):string { return this.get('/rest/twiml/join/:callId', {callId: callId}); }
    static twimlCallback(callId?:number):string { return this.get('/rest/twiml/callback/:callId', {callId: callId}); }

    private static get(urlPattern:string, values?:Object):string {
        if (values)
            for (var key in values)
                if (values[key] != null)
                    urlPattern = urlPattern.replace(new RegExp(':' + key), values[key])
        return url.resolve(TwilioUrlDelegate.BASE_URL, urlPattern);
    }
}
export = TwilioUrlDelegate