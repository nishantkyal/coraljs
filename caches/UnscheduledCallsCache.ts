///<reference path='../_references.d.ts'/>
///<reference path='./CacheHelper.ts'/>
///<reference path='../models/PhoneCall.ts'/>

module caches
{
    export class UnscheduledCallsCache
    {
        private KEY:String = 'CallPlanning';
    
        getUnscheduledCalls(expertId:number, scheduleId:number):Q.IPromise<any>
        {
            return CacheHelper.getFromOrderedSet(this.KEY, expertId + '-' + scheduleId);
        }
    
        addUnscheduledCall(expertId:number, scheduleId:number, call:models.PhoneCall):Q.IPromise<any>
        {
            return CacheHelper.addToOrderedSet(this.KEY, expertId + '-' + scheduleId, call);
        }
    }
}