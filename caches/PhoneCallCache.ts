import q                                                = require('q');
import CacheHelper                                      = require('./CacheHelper');
import PhoneCall                                        = require('../models/PhoneCall');

class PhoneCallCache
{
    addCall(call:PhoneCall, expiry?:number, overWrite?:boolean):q.Promise<any>
    {
        return CacheHelper.set('call-' + call.getId(), call, expiry, overWrite);
    }

    get(callId:number):q.Promise<any>
    {
        return CacheHelper.get('call-' + callId);
    }

    delete(callId:number):q.Promise<any>
    {
        return CacheHelper.del('call-' + callId);
    }

}
export = PhoneCallCache