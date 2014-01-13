var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

var Transaction = (function (_super) {
    __extends(Transaction, _super);
    function Transaction() {
        _super.apply(this, arguments);
    }
    /* Getters */
    Transaction.prototype.getTransactionId = function () {
        return this.transaction_id;
    };
    Transaction.prototype.getUserId = function () {
        return this.user_id;
    };
    Transaction.prototype.getTotal = function () {
        return this.total;
    };
    Transaction.prototype.getTotalUnit = function () {
        return this.total_unit;
    };
    Transaction.prototype.getStatus = function () {
        return this.status;
    };

    /* Setters */
    Transaction.prototype.setTransactionId = function (val) {
        this.transaction_id = val;
    };
    Transaction.prototype.setUserId = function (val) {
        this.user_id = val;
    };
    Transaction.prototype.setTotal = function (val) {
        this.total = val;
    };
    Transaction.prototype.setTotalUnit = function (val) {
        this.total_unit = val;
    };
    Transaction.prototype.setStatus = function (val) {
        this.status = val;
    };
    return Transaction;
})(BaseModel);

module.exports = Transaction;

//# sourceMappingURL=Transaction.js.map
