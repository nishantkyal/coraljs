var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('./BaseDAO');

/**
DAO for phone calls
**/
var PhoneCallDao = (function (_super) {
    __extends(PhoneCallDao, _super);
    function PhoneCallDao() {
        _super.apply(this, arguments);
    }
    PhoneCallDao.getClassName = function () {
        return 'call';
    };
    PhoneCallDao.getGeneratedIdName = function () {
        return 'call_id';
    };
    return PhoneCallDao;
})(BaseDAO);

module.exports = PhoneCallDao;

