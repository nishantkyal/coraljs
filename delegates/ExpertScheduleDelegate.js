var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var BaseDAODelegate = require('./BaseDaoDelegate');
var MysqlDelegate = require('./MysqlDelegate');
var ExpertScheduleDAO = require('../dao/ExpertScheduleDao');
var Schedule = require('../models/Schedule');


/**
* Delegate class for expert schedules
*/
var ExpertScheduleDelegate = (function (_super) {
    __extends(ExpertScheduleDelegate, _super);
    function ExpertScheduleDelegate() {
        _super.apply(this, arguments);
    }
    ExpertScheduleDelegate.prototype.getDao = function () {
        return new ExpertScheduleDAO();
    };

    ExpertScheduleDelegate.prototype.searchSchedule = function (keywords, startTime, endTime) {
        var query = 'SELECT im.integration_member_id expert_id, im.first_name ' + 'FROM integration_member im, integration_member_schedule s, integration_member_keywords k ' + 'WHERE ';
        return MysqlDelegate.executeQuery(query);
    };
    return ExpertScheduleDelegate;
})(BaseDAODelegate);

module.exports = ExpertScheduleDelegate;

//# sourceMappingURL=ExpertScheduleDelegate.js.map
