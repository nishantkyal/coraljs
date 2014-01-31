///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/UserOauth.ts'/>

module dao
{
    export class UserAuthDao extends BaseDao
    {

        static TABLE_NAME:string = 'user_oauth'

        /* Update token for given provider and oauth_uid without knowing the user */
        static updateTokenForProviderAndOAuthUid(providerId:String, oauthUserId:String, userOAuth:models.UserOauth):Q.IPromise<any>
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

            var query = 'UPDATE ' + UserAuthDao.TABLE_NAME + ' SET ' + updateFields.join(',') + ' WHERE provider_id = ? AND oauth_user_id = ?';
            return delegates.MysqlDelegate.executeQuery(query, values);
        }

        getModel():typeof models.BaseModel { return models.UserOauth; }
    }
}