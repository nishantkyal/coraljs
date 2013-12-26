var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('./BaseDAO');

var ScheduleDao = (function (_super) {
    __extends(ScheduleDao, _super);
    function ScheduleDao() {
        _super.apply(this, arguments);
    }
    ScheduleDao.getTableName = function () {
        return 'expert_schedule';
    };
    ScheduleDao.getGeneratedIdName = function () {
        return 'schedule_id';
    };
    return ScheduleDao;
})(BaseDAO);

module.exports = ScheduleDao;

//# sourceMappingURL=ScheduleDao.js.map
