var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('./BaseDAO');

var ServiceRequestDao = (function (_super) {
    __extends(ServiceRequestDao, _super);
    function ServiceRequestDao() {
        _super.apply(this, arguments);
    }
    ServiceRequestDao.getTableName = function () {
        return 'service_request';
    };
    ServiceRequestDao.getGeneratedIdName = function () {
        return 'request_id';
    };
    return ServiceRequestDao;
})(BaseDAO);

module.exports = ServiceRequestDao;

//# sourceMappingURL=ServiceRequestDao.js.map
