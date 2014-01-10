var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

var PhoneNumber = (function (_super) {
    __extends(PhoneNumber, _super);
    function PhoneNumber() {
        _super.apply(this, arguments);
    }
    /* Getters */
    PhoneNumber.prototype.getUserPhoneId = function () {
        return this.user_phone_id;
    };
    PhoneNumber.prototype.getUserId = function () {
        return this.user_id;
    };
    PhoneNumber.prototype.getCountryCode = function () {
        return this.country_code;
    };
    PhoneNumber.prototype.getAreaCode = function () {
        return this.area_code;
    };
    PhoneNumber.prototype.getPhone = function () {
        return this.phone;
    };
    PhoneNumber.prototype.getType = function () {
        return this.type;
    };
    PhoneNumber.prototype.getVerified = function () {
        return this.verified;
    };
    PhoneNumber.prototype.getVerificationCode = function () {
        return this.verification_code;
    };

    PhoneNumber.prototype.isValid = function () {
        return this.getUserId() != null && this.getPhone() != null;
    };

    /* Getters */
    PhoneNumber.prototype.setUserPhoneId = function (val) {
        this.user_phone_id = val;
    };
    PhoneNumber.prototype.setUserId = function (val) {
        this.user_id = val;
    };
    PhoneNumber.prototype.setCountryCode = function (val) {
        this.country_code = val;
    };
    PhoneNumber.prototype.setAreaCode = function (val) {
        this.area_code = val;
    };
    PhoneNumber.prototype.setPhone = function (val) {
        this.phone = val;
    };
    PhoneNumber.prototype.setType = function (val) {
        this.type = val;
    };
    PhoneNumber.prototype.setVerified = function (val) {
        this.verified = val;
    };
    PhoneNumber.prototype.setVerificationCode = function (val) {
        this.verification_code = val;
    };
    PhoneNumber.TABLE_NAME = 'user_phone';
    PhoneNumber.PRIMARY_KEY = 'user_phone_id';
    return PhoneNumber;
})(BaseModel);

module.exports = PhoneNumber;

