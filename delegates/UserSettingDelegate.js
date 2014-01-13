var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var q = require('q');

var BaseDaoDelegate = require('./BaseDaoDelegate');
var MysqlDelegate = require('./MysqlDelegate');
var UserSetting = require('../enums/UserSetting');
var Utils = require('../Utils');
var Config = require('../Config');

var UserSettingDelegate = (function (_super) {
    __extends(UserSettingDelegate, _super);
    function UserSettingDelegate() {
        _super.apply(this, arguments);
    }
    UserSettingDelegate.prototype.createPasswordResetToken = function (userId) {
        return this.search({
            'user_id': userId,
            'setting': UserSetting.PASSWORD_RESET_TOKEN_EXPIRY,
            'value': {
                'operator': '>',
                'value': new Date().getTime()
            }
        }).then(function tokenExpirySearched(tokens) {
            if (tokens.length == 0) {
                var transaction;
                var token;
                return MysqlDelegate.beginTransaction().then(function deleteOldTokenAfterTransactionStart(t) {
                    transaction = t;
                    return this.search({ 'user_id': userId, 'setting': { 'operator': 'IN', value: '(' + [UserSetting.PASSWORD_RESET_TOKEN, UserSetting.PASSWORD_RESET_TOKEN_EXPIRY].join(',') + ')' } }, ['id']).then(function oldSettingsSearched(settings) {
                        return q.all([
                            this.delete(settings[0]['id'], transaction),
                            this.delete(settings[1]['id'], transaction)
                        ]);
                    });
                }).then(function createNewTokenAfterOldDeleted() {
                    token = Utils.getRandomString(20);
                    return this.create({ 'user_id': userId, 'setting': UserSetting.PASSWORD_RESET_TOKEN, 'value': token }, transaction);
                }).then(function setNewTokenExpiryAfterCreate() {
                    return this.create({ 'user_id': userId, 'setting': UserSetting.PASSWORD_RESET_TOKEN_EXPIRY, 'value': new Date().getTime() + Config.get('password_token_expiry') }, transaction);
                }).then(function commitTransactionAfterExpirySet() {
                    MysqlDelegate.commit(transaction, token);
                }).then(function transactionCommitted() {
                    return token;
                });
            } else
                return this.search({ 'user_id': userId, 'setting': UserSetting.PASSWORD_RESET_TOKEN }, ['value']).then(function tokenFetched(tokens) {
                    return tokens[0];
                });
        });
    };

    UserSettingDelegate.prototype.createEmailVerificationToken = function (userId) {
        return this.search({
            'user_id': userId,
            'setting': UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY,
            'value': {
                'operator': '>',
                'value': new Date().getTime()
            }
        }).then(function tokenExpirySearched(tokens) {
            if (tokens.length == 0) {
                var transaction;
                var token;
                return MysqlDelegate.beginTransaction().then(function deleteOldTokenAfterTransactionStart(t) {
                    transaction = t;
                    return this.search({ 'user_id': userId, 'setting': { 'operator': 'IN', value: '(' + [UserSetting.EMAIL_VERIFICATION_TOKEN, UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY].join(',') + ')' } }, ['id']).then(function oldSettingsSearched(settings) {
                        return q.all([
                            this.delete(settings[0]['id'], transaction),
                            this.delete(settings[1]['id'], transaction)
                        ]);
                    });
                }).then(function createNewTokenAfterOldDeleted() {
                    token = Utils.getRandomString(20);
                    return this.create({ 'user_id': userId, 'setting': UserSetting.EMAIL_VERIFICATION_TOKEN, 'value': token }, transaction);
                }).then(function setNewTokenExpiryAfterCreate() {
                    return this.create({ 'user_id': userId, 'setting': UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY, 'value': new Date().getTime() + Config.get('password_token_expiry') }, transaction);
                }).then(function commitTransactionAfterExpirySet() {
                    MysqlDelegate.commit(transaction, token);
                }).then(function transactionCommitted() {
                    return token;
                });
            } else
                return this.search({ 'user_id': userId, 'setting': UserSetting.EMAIL_VERIFICATION_TOKEN }, ['value']).then(function tokenFetched(tokens) {
                    return tokens[0];
                });
        });
    };

    UserSettingDelegate.prototype.getDao = function () {
        return null;
    };
    return UserSettingDelegate;
})(BaseDaoDelegate);

module.exports = UserSettingDelegate;

//# sourceMappingURL=UserSettingDelegate.js.map
