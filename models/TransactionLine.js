var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

var TransactionLine = (function (_super) {
    __extends(TransactionLine, _super);
    function TransactionLine() {
        _super.apply(this, arguments);
    }
    TransactionLine.prototype.getTransactionId = function () {
        return this.transaction_id;
    };
    TransactionLine.prototype.getProductId = function () {
        return this.product_id;
    };
    TransactionLine.prototype.getProductType = function () {
        return this.product_type;
    };
    TransactionLine.prototype.getTransactionType = function () {
        return this.transaction_type;
    };
    TransactionLine.prototype.getAmount = function () {
        return this.amount;
    };
    TransactionLine.prototype.getAmountUnit = function () {
        return this.amount_unit;
    };

    TransactionLine.prototype.setTransactionId = function (val) {
        this.transaction_id = val;
    };
    TransactionLine.prototype.setProductId = function (val) {
        this.product_id = val;
    };
    TransactionLine.prototype.setProductType = function (val) {
        this.product_type = val;
    };
    TransactionLine.prototype.setTransactionType = function (val) {
        this.transaction_type = val;
    };
    TransactionLine.prototype.setAmount = function (val) {
        this.amount = val;
    };
    TransactionLine.prototype.setAmountUnit = function (val) {
        this.amount_unit = val;
    };
    return TransactionLine;
})(BaseModel);

module.exports = TransactionLine;

//# sourceMappingURL=TransactionLine.js.map
