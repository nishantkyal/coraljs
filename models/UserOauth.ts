import BaseModel                                    = require('../models/BaseModel');
import Utils                                        = require('../common/Utils');

/*
 * Bean class for User's oauth settings (FB, LinkedIn tokens)
 */
class UserOauth extends BaseModel
{
    static TABLE_NAME:string = 'user_oauth';

    static USER_ID:string                           = 'user_id';
    static PROVIDER_ID:string                       = 'provider_id';
    static OAUTH_USER_ID:string                     = 'oauth_user_id';
    static ACCESS_TOKEN:string                      = 'access_token';
    static ACCESS_TOKEN_EXPIRY:string               = 'access_token_expiry';
    static REFRESH_TOKEN:string                     = 'refresh_token';
    static REFRESH_TOKEN_EXPIRY:string              = 'refresh_token_expiry';
    static EMAIL:string                             = 'email';

    private user_id:number;
    private provider_id:string;
    private oauth_user_id:string;
    private access_token:string;
    private access_token_expiry:number;
    private refresh_token:string;
    private refresh_token_expiry:number;
    private email:string;

    static DEFAULT_FIELDS:string[] = [UserOauth.USER_ID, UserOauth.PROVIDER_ID, UserOauth.OAUTH_USER_ID, UserOauth.ACCESS_TOKEN,
        UserOauth.ACCESS_TOKEN_EXPIRY, UserOauth.REFRESH_TOKEN, UserOauth.REFRESH_TOKEN_EXPIRY, UserOauth.EMAIL];

    /* Getters */
    getUserId()                 { return this.user_id; }
    getProviderId()             { return this.provider_id; }
    getOauthUserId()            { return this.oauth_user_id; }
    getAccessToken()            { return this.access_token; }
    getAccessTokenExpiry()      { return this.access_token_expiry; }
    getRefreshToken()           { return this.refresh_token; }
    getRefreshTokenExpiry()     { return this.refresh_token_expiry; }
    getEmail()                  { return this.email; }

    isValid():boolean {
        return !Utils.isNullOrEmpty(this.getOauthUserId())
                    && !Utils.isNullOrEmpty(this.getProviderId())
                        && (!Utils.isNullOrEmpty(this.getAccessToken()) || !Utils.isNullOrEmpty(this.getRefreshToken()));
    }

    /* Setters */
    setUserId(val) { this.user_id = val; }
    setProviderId(val) { this.provider_id = val; }
    setOauthUserId(val) { this.oauth_user_id = val; }
    setAccessToken(val) { this.access_token = val; }
    setAccessTokenExpiry(val) { this.access_token_expiry = val; }
    setRefreshToken(val) { this.refresh_token = val; }
    setRefreshTokenExpiry(val) { this.refresh_token = val; }
    setEmail(val:string) { this.email = val; }

}
export = UserOauth