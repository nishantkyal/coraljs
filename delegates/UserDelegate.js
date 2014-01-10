var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};


var BaseDaoDelegate = require('./BaseDaoDelegate');
var UserSettingDelegate = require('./UserSettingDelegate');

var UserDAO = require('../dao/UserDao');
var User = require('../models/User');

/**
Delegate class for User operations
**/
var UserDelegate = (function (_super) {
    __extends(UserDelegate, _super);
    function UserDelegate() {
        _super.apply(this, arguments);
    }
    UserDelegate.prototype.create = function (user, transaction) {
        return _super.prototype.create.call(this, user, transaction).then(function userCreated(result) {
            return new User(result);
        });
    };

    UserDelegate.prototype.authenticate = function (mobileOrEmail, password) {
        return this.getDao().search({ email: mobileOrEmail, password: password }, { 'fields': ['id', 'first_name', 'last_name'] }).then(function authComplete(result) {
            if (result.length != 0)
                return new User(result[0]);
else
                throw ('Authentication failed: Username or password is wrong');
        });
    };

    UserDelegate.prototype.update = function (id, user) {
        delete user['user_id'];
        delete user['id'];
        delete user['email'];

        return _super.prototype.update.call(this, { user_id: id }, user);
    };

    UserDelegate.prototype.getDao = function () {
        return new UserDAO();
    };
    return UserDelegate;
})(BaseDaoDelegate);

module.exports = UserDelegate;

