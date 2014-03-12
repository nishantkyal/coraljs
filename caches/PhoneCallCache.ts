import q                    = require('q');
import Config               = require('../common/Config');
import Utils                = require('../common/Utils');
import CacheHelper          = require('./CacheHelper');
import PhoneCall            = require('../models/PhoneCall');

class PhoneCallCache
{
    createPhoneCallCache(call:PhoneCall):q.Promise<any>
    {
        var key:string = 'callId-' + call.getId();
        var secondsInAnHr:number = 60 * 60;
        return CacheHelper.set(key , call, secondsInAnHr);
    }

    getPhoneCall(callId:number):q.Promise<any>
    {
        return CacheHelper.get('callId-' + callId);
    }
}
export = PhoneCallCache