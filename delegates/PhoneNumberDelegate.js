var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var BaseDaoDelegate = require('./BaseDaoDelegate');

var PhoneNumberDao = require('../dao/PhoneNumberDao');
var PhoneNumber = require('../models/PhoneNumber');

var PhoneNumberDelegate = (function (_super) {
    __extends(PhoneNumberDelegate, _super);
    function PhoneNumberDelegate() {
        _super.apply(this, arguments);
    }
    PhoneNumberDelegate.prototype.create = function (data, transaction) {
        // Check that phone number doesn't already exist
        return _super.prototype.search.call(this, data).then(function handlePhoneNumberSearched(rows) {
            if (rows.length != 0)
                return this.create(data, transaction);
else
                return rows[0];
        });
    };

    PhoneNumberDelegate.prototype.update = function (id, phoneNumber) {
        return _super.prototype.update.call(this, { 'phoneNumberId': id }, phoneNumber);
    };

    PhoneNumberDelegate.prototype.getDao = function () {
        return new PhoneNumberDao();
    };
    return PhoneNumberDelegate;
})(BaseDaoDelegate);

module.exports = PhoneNumberDelegate;

