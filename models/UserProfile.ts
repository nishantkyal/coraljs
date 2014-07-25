import BaseModel                                        = require('./BaseModel');
import IntegrationMember                                = require('../models/IntegrationMember');

class UserProfile extends BaseModel
{
    static TABLE_NAME:string = 'user_profile';

    static COL_USER_ID:string                               = 'user_id';
    static COL_LOCALE:string                                = 'locale';
    static COL_SHORT_DESC:string                            = 'short_desc';
    static COL_LONG_DESC:string                             = 'long_desc';

    static DEFAULT_FIELDS:string[] = [UserProfile.COL_ID,  UserProfile.COL_USER_ID, UserProfile.COL_LOCALE, UserProfile.COL_SHORT_DESC, UserProfile.COL_LONG_DESC];

    private user_id:number;
    private locale:string;
    private short_desc:string;
    private long_desc:string;

    /* Getters */
    getUserId():number                                  { return this.user_id; }
    getLocale():string                                  { return this.locale; }
    getShortDesc():string                               { return this.short_desc; }
    getLongDesc():string                                { return this.long_desc; }

    /* Setters */
    setUserId(val:number):void                          { this.user_id = val; }
    setLocale(val:string):void                          { this.locale = val; }
    setShortDesc(val:string):void                       { this.short_desc = val; }
    setLongDesc(val:string):void                        { this.long_desc = val; }
}
export = UserProfile