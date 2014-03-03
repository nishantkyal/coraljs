import q                                = require('q');
import CacheHelper                      = require('./CacheHelper');
import PhoneCall                        = require('../models/PhoneCall');

class UnscheduledCallsCache
{
    private KEY:String = 'CallPlanning';

    getUnscheduledCalls(expertId:number, startTime:number):q.Promise<any>
    {
        var startTimeBucket = moment(startTime).seconds(0).milliseconds(0).minutes(0);
        return CacheHelper.getFromOrderedSet(this.KEY, expertId + '-' + startTimeBucket);
    }

    addUnscheduledCall(expertId:number, startTime:number, call:PhoneCall):q.Promise<any>
    {
        var startTimeBucket = moment(startTime).seconds(0).milliseconds(0).minutes(0);
        return CacheHelper.addToOrderedSet(this.KEY, expertId + '-' + startTimeBucket, call);
    }
}
export = UnscheduledCallsCache