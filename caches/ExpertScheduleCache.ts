import Schedule             = require('../models/ExpertSchedule');

/**
 * Cache of expert schedules for the next week
 * Start times and end times of expert's availability are computed for a week in advance for all experts and cached
 */
class ExpertScheduleCache
{
    /**
     * Get expert's available time slots for this week
     * @param expertId
     */
    getSchedule(expertId:string)
    {

    }

    /**
     * Get expert's availability in the duration
     * Throw error if startTime > weekEndTime or endTime < weekStartTime
     */
    isAvailable(expertId:string, startTime:number, endTime:number)
    {

    }

    /* Remove schedules for user */
    removeSchedules(expertIf:string)
    {

    }

    /* Add/Update schedule */
    saveSchedule(schedule:Schedule)
    {

    }

}
export = ExpertScheduleCache