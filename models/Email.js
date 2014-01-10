var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

/**
* Bean class for Email
*/
var Email = (function (_super) {
    __extends(Email, _super);
    function Email() {
        _super.apply(this, arguments);
    }
    /* Getters */
    Email.prototype.getRecipientEmail = function () {
        return this.recipient_email;
    };
    Email.prototype.getSenderEmail = function () {
        return this.sender_email;
    };
    Email.prototype.getSubject = function () {
        return this.subject;
    };
    Email.prototype.getTemplate = function () {
        return this.template;
    };
    Email.prototype.getEmailData = function () {
        return this.data;
    };
    Email.prototype.getScheduledDate = function () {
        return this.scheduled_date;
    };

    /* Setters */
    Email.prototype.setRecipientEmail = function (val) {
        this.recipient_email = val;
    };
    Email.prototype.setSenderEmail = function (val) {
        this.sender_email = val;
    };
    Email.prototype.setSubject = function (val) {
        this.subject = val;
    };
    Email.prototype.setTemplate = function (val) {
        this.template = val;
    };
    Email.prototype.setEmailData = function (val) {
        this.data = val;
    };
    Email.prototype.setScheduledDate = function (val) {
        this.scheduled_date = val;
    };
    Email.TABLE_NAME = 'email';
    return Email;
})(BaseModel);

module.exports = Email;

