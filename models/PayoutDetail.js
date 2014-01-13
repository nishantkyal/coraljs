var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

/**
* Bean class for payout details for User
* e.g. Bank accounts, paypal ids
*/
var PayoutDetail = (function (_super) {
    __extends(PayoutDetail, _super);
    function PayoutDetail() {
        _super.apply(this, arguments);
    }
    /** Getters **/
    PayoutDetail.prototype.getUserId = function () {
        return this.user_id;
    };
    PayoutDetail.prototype.getMode = function () {
        return this.mode;
    };
    PayoutDetail.prototype.getAccountHolderName = function () {
        return this.account_holder_name;
    };
    PayoutDetail.prototype.getAccountNum = function () {
        return this.account_num;
    };
    PayoutDetail.prototype.getIfscCode = function () {
        return this.ifsc_code;
    };
    PayoutDetail.prototype.getBankName = function () {
        return this.bank_name;
    };

    /** Setters **/
    PayoutDetail.prototype.setUserId = function (val) {
        this.user_id = val;
    };
    PayoutDetail.prototype.setMode = function (val) {
        this.mode = val;
    };
    PayoutDetail.prototype.setAccountHolderName = function (val) {
        this.account_holder_name = val;
    };
    PayoutDetail.prototype.setAccountNum = function (val) {
        this.account_num = val;
    };
    PayoutDetail.prototype.setIfscCode = function (val) {
        this.ifsc_code = val;
    };
    PayoutDetail.prototype.setBankName = function (val) {
        this.bank_name = val;
    };
    PayoutDetail.TABLE_NAME = 'payout_detail';
    PayoutDetail.PRIMARY_KEY = 'payout_detail_id';
    return PayoutDetail;
})(BaseModel);

module.exports = PayoutDetail;

//# sourceMappingURL=PayoutDetail.js.map
