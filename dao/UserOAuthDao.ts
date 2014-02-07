///<reference path='../_references.d.ts'/>
import q                        = require('q');
import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import UserOauth                = require('../models/UserOauth');
import MysqlDelegate            = require('../delegates/MysqlDelegate');

class UserOAuthDao extends BaseDao
{

    static TABLE_NAME:string = 'user_oauth'

    /* Update token for given provider and oauth_uid without knowing the user */
    static updateTokenForProviderAndOAuthUid(providerId:String, oauthUserId:String, userOAuth:UserOauth):q.Promise<any>
    {
        var values:string[] = [];
        var updateFields:string[] = [];

        if (userOAuth.getAccessToken())
        {
            updateFields.push('access_token = ?');
            values.push(userOAuth.getAccessToken());
        }

        if (userOAuth.getAccessTokenExpiry())
        {
            updateFields.push('access_token_expiry = ?');
            values.push(userOAuth.getAccessTokenExpiry());
        }

        if (userOAuth.getRefreshToken())
        {
            updateFields.push('refresh_token = ?');
            values.push(userOAuth.getRefreshToken());
        }

        if (userOAuth.getRefreshTokenExpiry())
        {
            updateFields.push('refresh_token_expiry = ?');
            values.push(userOAuth.getRefreshTokenExpiry());
        }

        values.push(userOAuth.getProviderId());
        values.push(userOAuth.getOauthUserId());

        var query = 'UPDATE ' + UserOAuthDao.TABLE_NAME + ' SET ' + updateFields.join(',') + ' WHERE provider_id = ? AND oauth_user_id = ?';
        return MysqlDelegate.executeQuery(query, values);
    }

    getModel():typeof BaseModel { return UserOauth; }
}
export = UserOAuthDao