import q                    = require('q');
import IDao                 = require('../dao/IDao');
import UserAuthDAO          = require('../dao/UserOAuthDao');
import BaseDaoDelegate      = require('BaseDaoDelegate');
import UserDelegate         = require('../delegates/UserDelegate');
import MysqlDelegate        = require('../delegates/MysqlDelegate');
import UserOAuth            = require('../models/UserOauth');
import User                 = require('../models/User');

/**
 Delegate class for managing user's oauth integrations (FB/LinkedIn logins)
 **/
class UserOAuthDelegate extends BaseDaoDelegate
{
    /* Add or update an OAuth token
     * Created new user if can't update
     * @param userOAuth
     * @returns {makePromise} User updated or created
     */
    addOrUpdateToken(userOAuth:UserOAuth):q.makePromise
    {
        var that = this;

        // 1. Try updating the token
        // 2. If it fails for uniqueness constraint, create a new user and add token to it
        return this.getDao().search({oauth_user_id: userOAuth.getOauthUserId(), provider_id: userOAuth.getProviderId()}, {'fields': ['id', 'user_id']})
            .then(
            function oauthSearchCompleted(existingTokens)
            {
                if (existingTokens.length != 0) {
                    var token = new UserOAuth(existingTokens[0]);
                    var oauthId:number = token.getId();
                    userOAuth.setUserId(token.getUserId());
                    return that.update(oauthId, userOAuth);
                }
                else {
                    var transaction = null;
                    var newUser:User = null;
                    return MysqlDelegate.beginTransaction()
                        .then(
                        function transactionStarted(t)
                        {
                            transaction = t;
                            return new UserDelegate().create({}, transaction);
                        })
                        .then(
                        function userCreated(user:User)
                        {
                            newUser = user;
                            userOAuth.setUserId(newUser.getId());
                            return that.getDao().create(userOAuth, transaction);
                        })
                        .then(
                        function oauthCreated(oauth:UserOAuth)
                        {
                            return MysqlDelegate.commit(transaction, newUser);
                        })
                        .then(
                        function transactionCommitted()
                        {
                            // Need to do this because this is a transaction and we won't have user in db until commit
                            return new UserDelegate().get(newUser.getId());
                        });
                }
            });

    }

    update(id:number, oauth:UserOAuth):q.makePromise
    {
        // Can't update user id for a token
        var userId = oauth.getUserId();
        oauth.setUserId(null);
        oauth.setId(null);

        return super.update({id: id}, oauth)
            .then(function oauthUpdated()
            {
                return new UserDelegate().get(userId);
            });
    }

    deleteByUser(userId:string):q.makePromise
    {
        // TODO: Implement delete oauth token
        return null;
    }

    getDao():IDao { return new UserAuthDAO(); }

}
export = UserOAuthDelegate