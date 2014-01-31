///<reference path='../_references.d.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='./MysqlDelegate.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../enums/UserSetting.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../common/Config.ts'/>

module delegates
{
    export class UserSettingDelegate extends BaseDaoDelegate
    {
        createPasswordResetToken(userId:string):Q.IPromise<any>
        {
            return this.search({
                'user_id': userId,
                'setting': enums.UserSetting.PASSWORD_RESET_TOKEN_EXPIRY,
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
                                return this.search({'user_id': userId, 'setting': {'operator': 'IN', value: '(' + [enums.UserSetting.PASSWORD_RESET_TOKEN, enums.UserSetting.PASSWORD_RESET_TOKEN_EXPIRY].join(',') + ')'}}, ['id'])
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
                                token = common.Utils.getRandomString(20);
                                return this.create({'user_id': userId, 'setting': enums.UserSetting.PASSWORD_RESET_TOKEN, 'value': token}, transaction);
                            })
                            .then(
                            function setNewTokenExpiryAfterCreate()
                            {
                                return this.create({'user_id': userId, 'setting': enums.UserSetting.PASSWORD_RESET_TOKEN_EXPIRY, 'value': new Date().getTime() + common.Config.get('password_token_expiry')}, transaction);
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
                        return this.search({'user_id': userId, 'setting': enums.UserSetting.PASSWORD_RESET_TOKEN}, ['value'])
                            .then(
                            function tokenFetched(tokens:Array) { return tokens[0]; }
                        );
                }
            );
        }

        createEmailVerificationToken(userId:string):Q.IPromise<any>
        {
            return this.search({
                'user_id': userId,
                'setting': enums.UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY,
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
                                return this.search({'user_id': userId, 'setting': {'operator': 'IN', value: '(' + [enums.UserSetting.EMAIL_VERIFICATION_TOKEN, enums.UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY].join(',') + ')'}}, ['id'])
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
                                token = common.Utils.getRandomString(20);
                                return this.create({'user_id': userId, 'setting': enums.UserSetting.EMAIL_VERIFICATION_TOKEN, 'value': token}, transaction);
                            })
                            .then(
                            function setNewTokenExpiryAfterCreate()
                            {
                                return this.create({'user_id': userId, 'setting': enums.UserSetting.EMAIL_VERIFICATION_TOKEN_EXPIRY, 'value': new Date().getTime() + common.Config.get('password_token_expiry')}, transaction);
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
                        return this.search({'user_id': userId, 'setting': enums.UserSetting.EMAIL_VERIFICATION_TOKEN}, ['value'])
                            .then(
                            function tokenFetched(tokens:Array) { return tokens[0]; }
                        );
                }
            );
        }

        getDao():dao.IDao { return null; }

    }
}