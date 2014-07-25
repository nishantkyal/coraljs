import BaseModel                                        = require('./BaseModel');
import Integration                                      = require('./Integration');
import User                                             = require('./User');
import UserProfile                                      = require('./UserProfile');
import ForeignKey                                       = require('./ForeignKey');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import IntegrationMemberRole                            = require('../enums/IntegrationMemberRole');
import ForeignKeyType                                   = require('../enums/ForeignKeyType');

/*
 Bean class for Integration member
 */
class IntegrationMember extends BaseModel
{
    static TABLE_NAME:string = 'integration_member';

    static COL_INTEGRATION_ID:string = 'integration_id';
    static COL_USER_ID:string = 'user_id';
    static COL_ROLE:string = 'role';
    static COL_AUTH_CODE:string = 'auth_code';
    static COL_ACCESS_TOKEN:string = 'access_token';
    static COL_ACCESS_TOKEN_EXPIRY:string = 'access_token_expiry';
    static COL_REFRESH_TOKEN:string = 'refresh_token';
    static COL_REFRESH_TOKEN_EXPIRY:string = 'refresh_token_expiry';
    static COL_REVENUE_SHARE:string = 'revenue_share';
    static COL_REVENUE_SHARE_UNIT:string = 'revenue_share_unit';

    static FK_USER:ForeignKey = new ForeignKey(ForeignKeyType.MANY_TO_ONE, IntegrationMember.COL_USER_ID, User, User.COL_ID);
    static FK_INTEGRATION:ForeignKey = new ForeignKey(ForeignKeyType.MANY_TO_ONE, IntegrationMember.COL_INTEGRATION_ID, Integration, Integration.COL_ID);

    static PUBLIC_FIELDS:string[] = [IntegrationMember.COL_ID, IntegrationMember.COL_INTEGRATION_ID, IntegrationMember.COL_ROLE, IntegrationMember.COL_USER_ID];
    static DASHBOARD_FIELDS:string[] = [IntegrationMember.COL_ID, IntegrationMember.COL_INTEGRATION_ID, IntegrationMember.COL_ROLE, IntegrationMember.COL_USER_ID, IntegrationMember.COL_REVENUE_SHARE, IntegrationMember.COL_REVENUE_SHARE_UNIT];

    private integration_id:number;
    private user_id:number;
    private invited_by_member_id:number;
    private role:IntegrationMemberRole;
    private auth_code:string;
    private access_token:string;
    private access_token_expiry:string;
    private refresh_token:string;
    private refresh_token_expiry:string;
    private revenue_share:number;
    private revenue_share_unit:number;

    constructor(data:Object = {})
    {
        super(data);
        if (!IntegrationMember._INITIALIZED)
        {
            IntegrationMember._INITIALIZED = true;
        }
    }

    /* Getters */
    getIntegrationId():number                           { return this.integration_id; }
    getUserId():number                                  { return this.user_id; }
    getInvitedByMemberId():number                       { return this.invited_by_member_id; }
    getRole():IntegrationMemberRole                     { return this.role; }
    getAuthCode():string                                { return this.auth_code; }
    getAccessToken():string                             { return this.access_token; }
    getAccessTokenExpiry():string                       { return this.access_token_expiry; }
    getRefreshToken():string                            { return this.refresh_token; }
    getRefreshTokenExpiry():string                      { return this.refresh_token_expiry; }
    getRevenueShare():number                            { return this.revenue_share; }
    getRevenueShareUnit():number                        { return this.revenue_share_unit; }

    getIntegration():Integration                        { return null; }
    getUser():User                                      { return null; }

    isValid():boolean {
        return !isNaN(this.getIntegrationId()) && !isNaN(this.getRole());
    }

    /* Setters */
    setIntegrationId(val:number):void                   { this.integration_id = val; }
    setUserId(val:number):void                          { this.user_id = val; }
    setInvitedByMemberId(val:number):void               { this.invited_by_member_id = val; }
    setRole(val:IntegrationMemberRole):void             { this.role = val; }
    setAuthCode(val:string):void                        { this.auth_code = val; }
    setAccessToken(val:string):void                     { this.access_token = val; }
    setAccessTokenExpiry(val:string):void               { this.access_token_expiry = val; }
    setRefreshToken(val:string):void                    { this.refresh_token = val; }
    setRefreshTokenExpiry(val:string):void              { this.refresh_token_expiry = val; }
    setRevenueShare(val:number):void                    { this.revenue_share = val; }
    setRevenueShareUnit(val:MoneyUnit):void             { this.revenue_share_unit = val; }

    setIntegration(val:Integration):void                { }
    setUser(val:User):void                              { }
}
export = IntegrationMember