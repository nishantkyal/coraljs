var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('./BaseDAO');

var PaymentDao = (function (_super) {
    __extends(PaymentDao, _super);
    function PaymentDao() {
        _super.apply(this, arguments);
    }
    PaymentDao.getTableName = function () {
        return 'payment';
    };

    PaymentDao.getGeneratedIdName = function () {
        return 'payment_id';
    };
    return PaymentDao;
})(BaseDAO);

module.exports = PaymentDao;

