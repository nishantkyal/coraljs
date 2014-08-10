///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import BaseDaoDelegate                              = require('./BaseDaoDelegate');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');
import UserOauth                                    = require('../models/UserOauth');
import User                                         = require('../models/User');
import Utils                                        = require('../common/Utils');

/*
 Delegate class for managing user's oauth integrations (FB/LinkedIn logins)
 */
class UserOAuthDelegate extends BaseDaoDelegate
{
    private userDelegate;

    constructor() {
        var UserDelegate  = require('../delegates/UserDelegate');
        this.userDelegate = new UserDelegate();
        super(UserOauth);
    }

    /* Add or update an OAuth token
     * Created new user if can't update
     */
    addOrUpdateToken(userOAuth:UserOauth, user:User, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var args = arguments;

        // 1. Try updating the token
        // 2. If it fails for uniqueness constraint, create a new user and add token to it
        //Oauth cannot exists without user while vice versa can be true. So if Oauth exists then user exists
        //and this function set that userId on Oauth
        var searchObject = {oauth_user_id: userOAuth.getOauthUserId(), provider_id: userOAuth.getProviderId()};

        return this.dao.search(searchObject, [UserOauth.COL_ID, UserOauth.COL_USER_ID], transaction)
            .then(
            function oauthSearchCompleted(existingTokens)
            {
                if (existingTokens.length != 0)
                {
                    var token = new UserOauth(existingTokens[0]);
                    var oauthId:number = token.getId();
                    userOAuth.setUserId(token.getUserId());
                    return self.update(oauthId, userOAuth)
                        .then(
                        function tokenUpdated()
                        {
                            return self.get(token.getId());
                        });
                }
                else
                {
                    if (Utils.isNullOrEmpty(transaction))
                        return MysqlDelegate.executeInTransaction(self, args);

                    return self.userDelegate.create(user, transaction)
                        .fail(
                        function userCreateError(error):any
                        {
                            if (error.code == 'ER_DUP_ENTRY')
                                return self.userDelegate.find(Utils.createSimpleObject(User.COL_EMAIL, user.getEmail()));
                            throw(error);
                        })
                        .then(
                        function userCreatedOrFetched(user:User):any
                        {
                            userOAuth.setUserId(user.getId());
                            return self.create(userOAuth, transaction);
                        })
                        .then(
                        function oauthCreated(oauth:UserOauth)
                        {
                            userOAuth.setId(oauth.getId());
                            return userOAuth;
                        });
                }
            });

    }

    update(id:number, oauth:UserOauth):q.Promise<any>
    {
        // Can't update user id for a token
        oauth.setUserId(null);
        oauth.setId(null);

        return super.update({id: id}, oauth);
    }

}
export = UserOAuthDelegate