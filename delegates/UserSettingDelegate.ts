import q                            = require('q');
import IDao                         = require('../dao/IDao');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import MysqlDelegate                = require('./MysqlDelegate');
import UserSetting                  = require('../enums/UserSetting');
import Utils                        = require('../Utils');
import Config                       = require('../Config');

class UserSettingDelegate extends BaseDaoDelegate
{
    createPasswordResetToken(userId:string):q.makePromise
    {
        return this.search({
            'user_id': userId,
            'setting': UserSetting.PASSWORD_RESET_TOKEN_EXPIRY,
            'value'  : {
                'operator': '>',
                'value'   : new Date().getTime()
            }
        })
            .then(
            function tokenExpirySearched(tokens:Array)
            {
                if (tokens.length == 0) {
                    var transaction;
                    var token;
                    return MysqlDelegate.beginTransaction()
                        .then(
                        function deleteOldTokenAfterTransactionStart(t)
                        {
                            transaction = t;
                            return this.search({'user_id': userId, 'setting': {'operator': 'IN', value: '(' + [UserSetting.PASSWORD_RESET_TOKEN, UserSetting.PASSWORD_RESET_TOKEN_EXPIRY].join(',') + ')'}}, ['id'])
                                .then(
                                function oldSettingsSearched(settings:Array)
                                {
                                    return q.all([
                                        this.delete(settings[0]['id'], transaction),
                                        this.delete(settings[1]['id'], transaction)
                                    ]);
                                })
                        })
                        .then(
                        function createNewTokenAfterOldDeleted()
                        {
                            token = Utils.getRandomString(20);
                            return this.create({'user_id': userId, 'setting': UserSetting.PASSWORD_RESET_TOKEN, 'value': token}, transaction);
                        })
                        .then(
                        function setNewTokenExpiryAfterCreate()
                        {
                            return this.create({'user_id': userId, 'setting': UserSetting.PASSWORD_RESET_TOKEN_EXPIRY, 'value': new Date().getTime() + Config.get('password_token_expiry')}, transaction);
                        })
                        .then(
                        function commitTransactionAfterExpirySet()
                        {
                            MysqlDelegate.commit(transaction, token);
                        })
                        .then(
                        function transactionCommitted()
                        {
                            return token;
                        });
                }
                else
                    return this.search({'user_id': userId, 'setting': UserSetting.PASSWORD_RESET_TOKEN}, ['value'])
                        .then(
                        function tokenFetched(tokens:Array) { return tokens[0]; }
                    );
            }
        );
    }

    createEmailVerificationToken(userId:string):q.makePromise
    {
        return this.search({
            'user_id': userId,
            'setting': UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY,
            'value'  : {
                'operator': '>',
                'value'   : new Date().getTime()
            }
        })
            .then(
            function tokenExpirySearched(tokens:Array)
            {
                if (tokens.length == 0) {
                    var transaction;
                    var token;
                    return MysqlDelegate.beginTransaction()
                        .then(
                        function deleteOldTokenAfterTransactionStart(t)
                        {
                            transaction = t;
                            return this.search({'user_id': userId, 'setting': {'operator': 'IN', value: '(' + [UserSetting.EMAIL_VERIFICATION_TOKEN, UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY].join(',') + ')'}}, ['id'])
                                .then(
                                function oldSettingsSearched(settings:Array)
                                {
                                    return q.all([
                                        this.delete(settings[0]['id'], transaction),
                                        this.delete(settings[1]['id'], transaction)
                                    ]);
                                })
                        })
                        .then(
                        function createNewTokenAfterOldDeleted()
                        {
                            token = Utils.getRandomString(20);
                            return this.create({'user_id': userId, 'setting': UserSetting.EMAIL_VERIFICATION_TOKEN, 'value': token}, transaction);
                        })
                        .then(
                        function setNewTokenExpiryAfterCreate()
                        {
                            return this.create({'user_id': userId, 'setting': UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY, 'value': new Date().getTime() + Config.get('password_token_expiry')}, transaction);
                        })
                        .then(
                        function commitTransactionAfterExpirySet()
                        {
                            MysqlDelegate.commit(transaction, token);
                        })
                        .then(
                        function transactionCommitted()
                        {
                            return token;
                        });
                }
                else
                    return this.search({'user_id': userId, 'setting': UserSetting.EMAIL_VERIFICATION_TOKEN}, ['value'])
                        .then(
                        function tokenFetched(tokens:Array) { return tokens[0]; }
                    );
            }
        );
    }

    getDao():IDao { return null; }

}
export = UserSettingDelegate