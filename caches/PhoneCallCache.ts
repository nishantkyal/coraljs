import q                                                = require('q');
import CacheHelper                                      = require('./CacheHelper');
import PhoneCall                                        = require('../models/PhoneCall');

class PhoneCallCache
{
    addCall(call:PhoneCall):q.Promise<any>
    {
        return CacheHelper.set('call-' + call.getId(), call);
    }

    get(callId:number):q.Promise<any>
    {
        return CacheHelper.get('call-' + callId);
    }

}
export = PhoneCallCache