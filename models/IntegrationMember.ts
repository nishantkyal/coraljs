import BaseModel                    = require('./BaseModel');
import Integration                  = require('./Integration');
import User                         = require('./User');

/**
 Bean class for Integration member
 **/
class IntegrationMember extends BaseModel
{
    static TABLE_NAME:string = 'integration_member';

    static INTEGRATION_ID:string = 'integration_id';
    static USER_ID:string = 'user_id';
    static ROLE:string = 'role';
    static AUTH_CODE:string = 'auth_code';
    static ACCESS_TOKEN:string = 'access_token';
    static ACCESS_TOKEN_EXPIRY:string = 'access_token_expiry';
    static REFRESH_TOKEN:string = 'refresh_token';
    static REFRESH_TOKEN_EXPIRY:string = 'refresh_token_expiry';

    private integration_id:number;
    private user_id:number;
    private role:number;
    private auth_code:string;
    private access_token:string;
    private access_token_expiry:string;
    private refresh_token:string;
    private refresh_token_expiry:string;
    private revenue_share:number;
    private revenue_share_unit:number;

    private integration:Integration;
    private user:User;

    /* Getters */
    getIntegrationId():number { return this.integration_id; }
    getUserId():number { return this.user_id; }
    getRole():number { return this.role; }
    getAuthCode():string { return this.auth_code; }
    getAccessToken():string { return this.access_token; }
    getAccessTokenExpiry():string { return this.access_token_expiry; }
    getRefreshToken():string { return this.refresh_token; }
    getRefreshTokenExpiry():string { return this.refresh_token_expiry; }
    getRevenueShare():number { return this.revenue_share; }
    getRevenueShareUnit():number { return this.revenue_share_unit; }

    isValid():boolean {
        return !isNaN(this.getIntegrationId()) && !isNaN(this.getId()) && !isNaN(this.getRole());
    }

    /** Setters */
    setIntegrationId(val:number):void { this.integration_id = val; }
    setUserId(val:number):void { this.user_id = val; }
    setRole(val:number):void { this.role = val; }
    setAuthCode(val:string):void { this.auth_code = val; }
    setAccessToken(val:string):void { this.access_token = val; }
    setAccessTokenExpiry(val:string):void { this.access_token_expiry = val; }
    setRefreshToken(val:string):void { this.refresh_token = val; }
    setRefreshTokenExpiry(val:string):void { this.refresh_token_expiry = val; }
    setRevenueShare(val) { this.revenue_share = val; }
    setRevenueShareUnit(val) { this.revenue_share_unit = val; }

}
export = IntegrationMember