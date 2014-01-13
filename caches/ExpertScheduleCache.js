var Schedule = require('../models/Schedule');

/**
* Cache of expert schedules for the next week
* Start times and end times of expert's availability are computed for a week in advance for all experts and cached
*/
var ExpertScheduleCache = (function () {
    function ExpertScheduleCache() {
    }
    /**
    * Get expert's available time slots for this week
    * @param expertId
    */
    ExpertScheduleCache.prototype.getSchedule = function (expertId) {
    };

    /**
    * Get expert's availability in the duration
    * Throw error if startTime > weekEndTime or endTime < weekStartTime
    */
    ExpertScheduleCache.prototype.isAvailable = function (expertId, startTime, endTime) {
    };

    /* Remove schedules for user */
    ExpertScheduleCache.prototype.removeSchedules = function (expertIf) {
    };

    /* Add/Update schedule */
    ExpertScheduleCache.prototype.saveSchedule = function (schedule) {
    };
    return ExpertScheduleCache;
})();

module.exports = ExpertScheduleCache;

//# sourceMappingURL=ExpertScheduleCache.js.map
