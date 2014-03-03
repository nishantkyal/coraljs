import BaseModel                                = require('./BaseModel')
import Utils                                    = require('../common/Utils');
import UserProfile                              = require('../models/UserProfile');
/**
 Bean class for User
 **/
class User extends BaseModel
{
    static TABLE_NAME:string = 'user';

    static FIRST_NAME:string = 'first_name';
    static LAST_NAME:string = 'last_name';
    static MOBILE:string = 'mobile';
    static EMAIL:string = 'email';
    static PASSWORD:string = 'password';
    static VERIFIED:string = 'verified';
    static ACTIVATED:string = 'activated';
    static SHORT_DESC:string = 'short_desc';
    static LONG_DESC:string = 'long_desc';
    static USER_PROFILE:string = 'user_profile';

    private first_name:string;
    private last_name:string;
    private mobile:string;
    private email:string;
    private password:string;
    private verified:boolean;
    private activated:boolean;
    private long_desc:string;
    private short_desc:string;

    private user_profile:UserProfile;

    /** Getters **/
    getFirstName():string                                       { return this.first_name; }
    getLastName():string                                        { return this.last_name; }
    getMobile():string                                          { return this.mobile; }
    getEmail():string                                           { return this.email; }
    getPassword():string                                        { return this.password; }
    getVerified():boolean                                       { return this.verified; }
    getActivated():boolean                                      { return this.activated; }
    getShortDesc():string                                       { return this.short_desc; }
    getLongDesc():string                                        { return this.long_desc; }

    getUserProfile():UserProfile                                { return this.user_profile; }

    isValid():boolean {
        return this.getId() != null && this.getId() != undefined;
    }

    /** Setters **/
    setFirstName(val:string)                                    { this.first_name = val; }
    setLastName(val:string)                                     { this.last_name = val; }
    setMobile(val:string)                                       { this.mobile = val; }
    setEmail(val:string)                                        { this.email = val; }
    setPassword(val:string)                                     { this.password = val; }
    setVerified(val:boolean)                                    { this.verified = val; }
    setActivated(val:boolean)                                   { this.activated = val; }
    setShortDesc(val:string)                                    { this.short_desc = val; }
    setLongDesc(val:string)                                     { this.long_desc = val; }

    setUserProfile(val:UserProfile):void                        { this.user_profile = val; }

}
export = User