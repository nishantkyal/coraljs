import Schedule                                         = require('../models/Schedule');
import CacheHelperFactory                               = require('../factories/CacheHelperFactory');
import CacheHelperType                                  = require('../enums/CacheHelperType');
/*
 * Cache of expert schedules for the next week
 * Start times and end times of expert's availability are computed for a week in advance for all experts and cached
 */
class ExpertScheduleCache
{
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);
    /* Get expert's available time slots for this week */
    getSchedule(expertId:string)
    {

    }

    /*
     * Get expert's availability in the duration
     * Throw error if startTime > weekEndTime or endTime < weekStartTime
     */
    isAvailable(expertId:string)
    {

    }

    /* Remove schedules for user */
    removeSchedules(expertId:string)
    {

    }

    /* Add/Update schedule */
    saveSchedule(schedule:Schedule)
    {

    }

}
export = ExpertScheduleCache