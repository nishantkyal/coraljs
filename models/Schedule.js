var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('../models/BaseModel');

var Schedule = (function (_super) {
    __extends(Schedule, _super);
    function Schedule() {
        _super.apply(this, arguments);
    }
    /* Getters */
    Schedule.prototype.getScheduleId = function () {
        return this.schedule_id;
    };
    Schedule.prototype.getIntegrationMemberId = function () {
        return this.integration_member_id;
    };
    Schedule.prototype.getIsActive = function () {
        return this.active;
    };

    /* Setters */
    Schedule.prototype.setScheduleId = function (val) {
        this.schedule_id = val;
    };
    Schedule.prototype.setIntegrationMemberId = function (val) {
        this.integration_member_id = val;
    };
    Schedule.prototype.setIsActive = function (val) {
        this.active = val;
    };
    return Schedule;
})(BaseModel);

module.exports = Schedule;

//# sourceMappingURL=Schedule.js.map
