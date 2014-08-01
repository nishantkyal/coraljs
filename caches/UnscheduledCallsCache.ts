import q                                = require('q');
import PhoneCall                        = require('../models/PhoneCall');
import moment                           = require('moment');
import CacheHelperFactory               = require('../factories/CacheHelperFactory');
import CacheHelperType                  = require('../enums/CacheHelperType');

class UnscheduledCallsCache
{
    private KEY:String = 'CallPlanning';
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);

    getUnscheduledCalls(expertId:number, startTime:number):q.Promise<any>
    {
        var startTimeBucket = moment(startTime).seconds(0).milliseconds(0).minutes(0);
        return this.cacheHelper.getFromOrderedSet(this.KEY, expertId + '-' + startTimeBucket);
    }

    addUnscheduledCall(expertId:number, startTime:number, call:PhoneCall):q.Promise<any>
    {
        var startTimeBucket = moment(startTime).seconds(0).milliseconds(0).minutes(0);
        return this.cacheHelper.addToOrderedSet(this.KEY, expertId + '-' + startTimeBucket, call);
    }
}
export = UnscheduledCallsCache