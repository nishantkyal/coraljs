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
var TransactionDao = (function (_super) {
    __extends(TransactionDao, _super);
    function TransactionDao() {
        _super.apply(this, arguments);
    }
    TransactionDao.getClassName = function () {
        return 'transaction';
    };
    TransactionDao.getGeneratedIdName = function () {
        return 'transaction_id';
    };
    return TransactionDao;
})(BaseDAO);

module.exports = TransactionDao;

//# sourceMappingURL=TransactionDao.js.map
