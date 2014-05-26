import BaseModel                                        = require('./BaseModel');
import Integration                                      = require('./Integration');
import User                                             = require('./User');
import UserProfile                                      = require('./UserProfile');
import ExpertSchedule                                   = require('./ExpertSchedule');
import ExpertScheduleRule                               = require('./ExpertScheduleRule');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import IntegrationMemberRole                            = require('../enums/IntegrationMemberRole');
/*
 Bean class for Integration member
 */
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
    static REVENUE_SHARE:string = 'revenue_share';
    static REVENUE_SHARE_UNIT:string = 'revenue_share_unit';

    static INTEGRATION:string = 'integration';
    static USER:string = 'user';
    static SCHEDULE:string = 'schedule';
    static SCHEDULE_RULE:string = 'schedule_rule';

    static DEFAULT_FIELDS:string[] = [IntegrationMember.ID, IntegrationMember.INTEGRATION_ID, IntegrationMember.ROLE, IntegrationMember.USER_ID];
    static DASHBOARD_FIELDS:string[] = [IntegrationMember.ID, IntegrationMember.INTEGRATION_ID, IntegrationMember.ROLE, IntegrationMember.USER_ID, IntegrationMember.REVENUE_SHARE, IntegrationMember.REVENUE_SHARE_UNIT];

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

    private integration:Integration;
    private user:User;
    private user_profile:UserProfile;
    private schedule:ExpertSchedule[];
    private schedule_rule:ExpertScheduleRule[];

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

    getIntegration():Integration                        { return this.integration; }
    getUser():User                                      { return this.user; }
    getUserProfile():UserProfile                        { return this.user_profile; }
    getSchedule():ExpertSchedule[]                      { return this.schedule; }
    getScheduleRule():ExpertScheduleRule[]              { return this.schedule_rule; }

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

    setIntegration(val:Integration):void                { this.integration = val; }
    setUser(val:User):void                              { this.user = val; }
    setUserProfile(val:UserProfile):void                { this.user_profile = val; }
    setSchedule(val:ExpertSchedule[]):void              { this.schedule = val; }
    setScheduleRule(val:ExpertScheduleRule[]):void      { this.schedule_rule = val; }
}
export = IntegrationMember