var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('../dao/BaseDAO');

var TransactionLineDao = (function (_super) {
    __extends(TransactionLineDao, _super);
    function TransactionLineDao() {
        _super.apply(this, arguments);
    }
    TransactionLineDao.getTableName = function () {
        return 'transaction_line';
    };
    return TransactionLineDao;
})(BaseDAO);

module.exports = TransactionLineDao;

//# sourceMappingURL=TransactionLineDao.js.map
