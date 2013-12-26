var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

var Payment = (function (_super) {
    __extends(Payment, _super);
    function Payment() {
        _super.apply(this, arguments);
    }
    /* Getters */
    Payment.prototype.getPaymentId = function () {
        return this.payment_id;
    };
    Payment.prototype.getUserId = function () {
        return this.user_id;
    };
    Payment.prototype.getAmount = function () {
        return this.amount;
    };
    Payment.prototype.getUpdateDate = function () {
        return this.update_date;
    };
    Payment.prototype.getTransactionId = function () {
        return this.transaction_id;
    };
    Payment.prototype.getStatus = function () {
        return this.status;
    };

    /* Setters */
    Payment.prototype.setPaymentId = function (val) {
        this.payment_id = val;
    };
    Payment.prototype.setUserId = function (val) {
        this.user_id = val;
    };
    Payment.prototype.setAmount = function (val) {
        this.amount = val;
    };
    Payment.prototype.setUpdateDate = function (val) {
        this.update_date = val;
    };
    Payment.prototype.setTransactionId = function (val) {
        this.transaction_id = val;
    };
    Payment.prototype.setStatus = function (val) {
        this.status = val;
    };
    Payment.TABLE_NAME = 'payment';
    Payment.PRIMARY_KEY = 'id';
    return Payment;
})(BaseModel);

module.exports = Payment;

//# sourceMappingURL=Payment.js.map
