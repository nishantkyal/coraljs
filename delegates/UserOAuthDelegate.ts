///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import IDao                                         = require('../dao/IDao');
import UserAuthDAO                                  = require('../dao/UserOAuthDao');
import BaseDaoDelegate                              = require('./BaseDaoDelegate');
import UserDelegate                                 = require('../delegates/UserDelegate');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');
import UserOAuth                                    = require('../models/UserOauth');
import User                                         = require('../models/User');
import Utils                                        = require('../common/Utils');
/*
 Delegate class for managing user's oauth integrations (FB/LinkedIn logins)
 */
class UserOAuthDelegate extends BaseDaoDelegate
{
    /* Add or update an OAuth token
     * Created new user if can't update
     */
    addOrUpdateToken(userOAuth:UserOAuth, user?:User):q.Promise<any>
    {
        var self = this;

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
                    return self.update(oauthId, userOAuth);
                }
                else {
                    var transaction = null;
                    var newUser:User = null;

                    if (Utils.isNullOrEmpty(transaction))
                        return MysqlDelegate.executeInTransaction(this, arguments);

                    return new UserDelegate().create(user, transaction)
                        .then(
                        function userCreated(user:User)
                        {
                            newUser = user;
                            userOAuth.setUserId(newUser.getId());
                            return self.create(userOAuth, transaction);
                        });
                }
            });

    }

    update(id:number, oauth:UserOAuth):q.Promise<any>
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

    deleteByUser(userId:string):q.Promise<any>
    {
        // TODO: Implement delete oauth token
        return null;
    }

    getDao():IDao { return new UserAuthDAO(); }

}
export = UserOAuthDelegate