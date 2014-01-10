var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('./BaseDAO');

var ExpertScheduleDao = (function (_super) {
    __extends(ExpertScheduleDao, _super);
    function ExpertScheduleDao() {
        _super.apply(this, arguments);
    }
    ExpertScheduleDao.getTableName = function () {
        return 'expert_schedule';
    };
    ExpertScheduleDao.getGeneratedIdName = function () {
        return 'schedule_id';
    };
    return ExpertScheduleDao;
})(BaseDAO);

module.exports = ExpertScheduleDao;

