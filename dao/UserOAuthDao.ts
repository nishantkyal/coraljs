import BaseDAO          = require('../dao/BaseDAO')
import BaseModel        = require('../models/BaseModel')
import UserOAuth        = require('../models/UserOauth');
import MysqlDelegate    = require('../delegates/MysqlDelegate');

/**
 DAO for User
 No business logic goes here, only data access layer
 **/
class UserAuthDao extends BaseDAO {

    static TABLE_NAME:string = 'user_oauth'

    /**
     * Update token for given provider and oauth_uid without knowing the user
     * @param providerId
     * @param oauthUserId
     * @param userOAuth
     * @param callback
     */
    static updateTokenForProviderAndOAuthUid(providerId:String, oauthUserId:String, userOAuth:UserOAuth, callback:Function) {
        var values:string[] = [];
        var updateFields:string[] = [];

        if (userOAuth.getAccessToken()) {
            updateFields.push('access_token = ?');
            values.push(userOAuth.getAccessToken());
        }

        if (userOAuth.getAccessTokenExpiry()) {
            updateFields.push('access_token_expiry = ?');
            values.push(userOAuth.getAccessTokenExpiry());
        }

        if (userOAuth.getRefreshToken()) {
            updateFields.push('refresh_token = ?');
            values.push(userOAuth.getRefreshToken());
        }

        if (userOAuth.getRefreshTokenExpiry()) {
            updateFields.push('refresh_token_expiry = ?');
            values.push(userOAuth.getRefreshTokenExpiry());
        }

        values.push(userOAuth.getProviderId());
        values.push(userOAuth.getOauthUserId());

        var query = 'UPDATE ' + UserAuthDao.TABLE_NAME + ' SET ' + updateFields.join(',') + ' WHERE provider_id = ? AND oauth_user_id = ?';
        MysqlDelegate.executeQuery(query, values, callback);
    }

    getModel():typeof BaseModel { return UserOAuth; }


}
export = UserAuthDao