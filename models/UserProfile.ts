import BaseModel                                        = require('./BaseModel');
import IntegrationMember                                = require('../models/IntegrationMember');

class UserProfile extends BaseModel
{
    static TABLE_NAME:string = 'user_profile';

    static USER_ID:string                               = 'user_id';
    static LOCALE:string                                = 'locale';
    static SHORT_DESC:string                            = 'short_desc';
    static LONG_DESC:string                             = 'long_desc';

    static DEFAULT_FIELDS:string[] = [UserProfile.ID,  UserProfile.USER_ID, UserProfile.LOCALE, UserProfile.SHORT_DESC, UserProfile.LONG_DESC];

    private integration_member_id:number;
    private locale:string;
    private short_desc:string;
    private long_desc:string;

    /* Getters */
    getUserId():number                                  { return this.integration_member_id; }
    getLocale():string                                  { return this.locale; }
    getShortDesc():string                               { return this.short_desc; }
    getLongDesc():string                                { return this.long_desc; }

    /* Setters */
    setUserId(val:number):void                          { this.integration_member_id = val; }
    setLocale(val:string):void                          { this.locale = val; }
    setShortDesc(val:string):void                       { this.short_desc = val; }
    setLongDesc(val:string):void                        { this.long_desc = val; }
}
export = UserProfile