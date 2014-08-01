import q                                                = require('q');
import CacheHelperFactory                               = require('../factories/CacheHelperFactory');
import PhoneCall                                        = require('../models/PhoneCall');
import CacheHelperType                                  = require('../enums/CacheHelperType');

class PhoneCallCache
{
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);

    addCall(call:PhoneCall, expiry?:number, overWrite?:boolean):q.Promise<any>
    {
        return this.cacheHelper.set('call-' + call.getId(), call, expiry, overWrite);
    }

    get(callId:number):q.Promise<any>
    {
        return this.cacheHelper.get('call-' + callId);
    }

    delete(callId:number):q.Promise<any>
    {
        return this.cacheHelper.del('call-' + callId);
    }

}
export = PhoneCallCache