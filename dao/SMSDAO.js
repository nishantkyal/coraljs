var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('./BaseDAO');

var SmsDao = (function (_super) {
    __extends(SmsDao, _super);
    function SmsDao() {
        _super.apply(this, arguments);
    }
    SmsDao.getTableName = function () {
        return 'sms';
    };
    return SmsDao;
})(BaseDAO);

module.exports = SmsDao;

