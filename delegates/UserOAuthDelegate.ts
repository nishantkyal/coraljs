///<reference path='../_references.d.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/UserOAuthDao.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='./UserDelegate.ts'/>
///<reference path='./MysqlDelegate.ts'/>
///<reference path='../models/User.ts'/>
///<reference path='../models/UserOauth.ts'/>

/**
 Delegate class for managing user's oauth integrations (FB/LinkedIn logins)
 **/
module delegates
{
    export class UserOAuthDelegate extends BaseDaoDelegate
    {
        /* Add or update an OAuth token
         * Created new user if can't update
         * @param userOAuth
         * @returns {makePromise} User updated or created
         */
        addOrUpdateToken(userOAuth:models.UserOauth, user?:models.User):Q.IPromise<any>
        {
            var that = this;

            // 1. Try updating the token
            // 2. If it fails for uniqueness constraint, create a new user and add token to it
            return this.getDao().search({oauth_user_id: userOAuth.getOauthUserId(), provider_id: userOAuth.getProviderId()}, {'fields': ['id', 'user_id']})
                .then(
                function oauthSearchCompleted(existingTokens)
                {
                    if (existingTokens.length != 0) {
                        var token = new models.UserOauth(existingTokens[0]);
                        var oauthId:number = token.getId();
                        userOAuth.setUserId(token.getUserId());
                        return that.update(oauthId, userOAuth);
                    }
                    else {
                        var transaction = null;
                        var newUser:models.User = null;
                        return MysqlDelegate.beginTransaction()
                            .then(
                            function transactionStarted(t)
                            {
                                transaction = t;
                                return new delegates.UserDelegate().create(user, transaction);
                            })
                            .then(
                            function userCreated(user:models.User)
                            {
                                newUser = user;
                                userOAuth.setUserId(newUser.getId());
                                return that.getDao().create(userOAuth, transaction);
                            })
                            .then(
                            function oauthCreated(oauth:models.UserOauth)
                            {
                                return MysqlDelegate.commit(transaction, newUser);
                            })
                            .then(
                            function transactionCommitted()
                            {
                                // Need to do this because this is a transaction and we won't have user in db until commit
                                return new delegates.UserDelegate().get(newUser.getId());
                            });
                    }
                });

        }

        update(id:number, oauth:models.UserOauth):Q.IPromise<any>
        {
            // Can't update user id for a token
            var userId = oauth.getUserId();
            oauth.setUserId(null);
            oauth.setId(null);

            return super.update({id: id}, oauth)
                .then(function oauthUpdated()
                {
                    return new delegates.UserDelegate().get(userId);
                });
        }

        deleteByUser(userId:string):Q.IPromise<any>
        {
            // TODO: Implement delete oauth token
            return null;
        }

        getDao():dao.IDao { return new dao.UserAuthDao(); }

    }
}