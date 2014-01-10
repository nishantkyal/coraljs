var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var _ = require('underscore');
var BaseDAODelegate = require('./BaseDaoDelegate');

var TransactionDAO = require('../dao/TransactionDao');

var TransactionDelegate = (function (_super) {
    __extends(TransactionDelegate, _super);
    function TransactionDelegate() {
        _super.apply(this, arguments);
    }
    TransactionDelegate.prototype.search = function (user_id, filters, fields) {
        filters['user_id'] = user_id;
        return _super.prototype.search.call(this, filters, { 'fields': fields });
    };

    TransactionDelegate.prototype.getAccountBalance = function (user_id) {
        return _super.prototype.search.call(this, { user_id: user_id }, ['total']).then(function transactionsFetched(transactions) {
            var sumTotal = _.reduce(_.pluck(transactions, 'total'), function (memo, num) {
                return memo + num;
            }, 0);
            return sumTotal;
        });
    };

    TransactionDelegate.prototype.getDao = function () {
        return new TransactionDAO();
    };
    return TransactionDelegate;
})(BaseDAODelegate);

module.exports = TransactionDelegate;

