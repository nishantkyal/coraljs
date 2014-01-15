import BaseModel = require('./BaseModel')

/**
 Bean class for Integration member
 **/
class IntegrationMember extends BaseModel {

    static TABLE_NAME:string = 'integration_member';
    static PRIMARY_KEY:string = 'integration_member_id';

    private integration_member_id:number;
    private integration_id:number;
    private user_id:number;
    private role:number;
    private auth_code:string;
    private access_token:string;
    private access_token_expiry:string;
    private refresh_token:string;
    private refresh_token_expiry:string;

    /** Getters */
    getIntegrationMemberId():number { return this.integration_member_id; }
    getIntegrationId():number { return this.integration_id; }
    getUserId():number { return this.user_id; }
    getRole():number { return this.role; }
    getAuthCode():string { return this.auth_code; }
    getAccessToken():string { return this.access_token; }
    getAccessTokenExpiry():string { return this.access_token_expiry; }
    getRefreshToken():string { return this.refresh_token; }
    getRefreshTokenExpiry():string { return this.refresh_token_expiry; }

    isValid():boolean {
        return !isNaN(this.getIntegrationId()) && !isNaN(this.getIntegrationMemberId()) && !isNaN(this.getRole());
    }

    /** Setters */
    setIntegrationMemberId(val:number):void {  this.integration_member_id = val; }
    setIntegrationId(val:number):void {  this.integration_id = val; }
    setUserId(val:number):void {  this.user_id = val; }
    setRole(val:number):void {  this.role = val; }
    setAuthCode(val:string):void {  this.auth_code = val; }
    setAccessToken(val:string):void {  this.access_token = val; }
    setAccessTokenExpiry(val:string):void {  this.access_token_expiry = val; }
    setRefreshToken(val:string):void {  this.refresh_token = val; }
    setRefreshTokenExpiry(val:string):void {  this.refresh_token_expiry = val; }

}
export = IntegrationMember