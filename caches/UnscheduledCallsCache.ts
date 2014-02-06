import q                                = require('q');
import CacheHelper                      = require('./CacheHelper');
import PhoneCall                        = require('../models/PhoneCall');

class UnscheduledCallsCache
{
    private KEY:String = 'CallPlanning';

    getUnscheduledCalls(expertId:number, scheduleId:number):q.Promise<any>
    {
        return CacheHelper.getFromOrderedSet(this.KEY, expertId + '-' + scheduleId);
    }

    addUnscheduledCall(expertId:number, scheduleId:number, call:PhoneCall):q.Promise<any>
    {
        return CacheHelper.addToOrderedSet(this.KEY, expertId + '-' + scheduleId, call);
    }
}
export = UnscheduledCallsCache