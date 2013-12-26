var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

var SMS = (function (_super) {
    __extends(SMS, _super);
    function SMS() {
        _super.apply(this, arguments);
    }
    /* Getters */
    SMS.prototype.getCountryCode = function () {
        return this.country_code;
    };
    SMS.prototype.getAreaCode = function () {
        return this.area_code;
    };
    SMS.prototype.getPhone = function () {
        return this.phone;
    };
    SMS.prototype.getSender = function () {
        return this.sender;
    };
    SMS.prototype.getMessage = function () {
        return this.message;
    };
    SMS.prototype.getScheduledDate = function () {
        return this.scheduled_date;
    };
    SMS.prototype.getStatus = function () {
        return this.status;
    };

    /* Setters */
    SMS.prototype.setCountryCode = function (val) {
        this.country_code = val;
    };
    SMS.prototype.setAreaCode = function (val) {
        this.area_code = val;
    };
    SMS.prototype.setPhone = function (val) {
        this.phone = val;
    };
    SMS.prototype.setSender = function (val) {
        this.sender = val;
    };
    SMS.prototype.setMessage = function (val) {
        this.message = val;
    };
    SMS.prototype.setScheduledDate = function (val) {
        this.scheduled_date = val;
    };
    SMS.prototype.setStatus = function (val) {
        this.status = val;
    };
    return SMS;
})(BaseModel);

module.exports = SMS;

//# sourceMappingURL=SMS.js.map
