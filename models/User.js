var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');


/**
Bean class for User
**/
var User = (function (_super) {
    __extends(User, _super);
    function User() {
        _super.apply(this, arguments);
    }
    /** Getters **/
    User.prototype.getFirstName = function () {
        return this.first_name;
    };
    User.prototype.getLastName = function () {
        return this.last_name;
    };
    User.prototype.getMobile = function () {
        return this.mobile;
    };
    User.prototype.getEmail = function () {
        return this.email;
    };
    User.prototype.getPassword = function () {
        return this.password;
    };
    User.prototype.getVerified = function () {
        return this.verified;
    };
    User.prototype.getActivated = function () {
        return this.activated;
    };
    User.prototype.isValid = function () {
        return this.getId() != null && this.getId() != undefined;
    };

    /** Setters **/
    User.prototype.setFirstName = function (val) {
        this.first_name = val;
    };
    User.prototype.setLastName = function (val) {
        this.last_name = val;
    };
    User.prototype.setMobile = function (val) {
        this.mobile = val;
    };
    User.prototype.setEmail = function (val) {
        this.email = val;
    };
    User.prototype.setPassword = function (val) {
        this.password = val;
    };
    User.prototype.setVerified = function (val) {
        this.verified = val;
    };
    User.prototype.setActivated = function (val) {
        this.activated = val;
    };
    return User;
})(BaseModel);

module.exports = User;

//# sourceMappingURL=User.js.map
