///<reference path='../_references.d.ts'/>
import BaseModel                                        = require('./BaseModel');
import ProfileStatus                                    = require('../enums/ProfileStatus');

class UserProfile extends BaseModel
{
    static TABLE_NAME:string = 'user_profile';

    static INTEGRATION_MEMBER_ID:string                 = 'integration_member_id';
    static LOCALE:string                                = 'locale';
    static SHORT_DESC:string                            = 'short_desc';
    static LONG_DESC:string                             = 'long_desc';
    static STATUS:string                                = 'status';

    static DEFAULT_FIELDS:string[] = [UserProfile.ID,  UserProfile.INTEGRATION_MEMBER_ID, UserProfile.LOCALE, UserProfile.SHORT_DESC, UserProfile.LONG_DESC, UserProfile.STATUS];

    private integration_member_id:number;
    private locale:string;
    private short_desc:string;
    private long_desc:string;
    private status:ProfileStatus;

    /* Getters */
    getIntegrationMemberId():number                     { return this.integration_member_id; }
    getLocale():string                                  { return this.locale; }
    getShortDesc():string                               { return this.short_desc; }
    getLongDesc():string                                { return this.long_desc; }
    getStatus():ProfileStatus                           { return this.status; }

    /* Setters */
    setIntegrationMemberId(val:number):void             { this.integration_member_id = val; }
    setLocale(val:string):void                          { this.locale = val; }
    setShortDesc(val:string):void                       { this.short_desc = val; }
    setLongDesc(val:string):void                        { this.long_desc = val; }
    setStatus(val:ProfileStatus):void                   { this.status = val; }
}
export = UserProfile