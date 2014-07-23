import crypto                                                           = require('crypto');
import validator                                            = require('validator');
import BaseModel                                            = require('./BaseModel')
import Utils                                                = require('../common/Utils');
import Formatter                                            = require('../common/Formatter');
import UserProfile                                          = require('../models/UserProfile');
import UserSkill                                            = require('../models/UserSkill');
import UserEducation                                        = require('../models/UserEducation');
import UserEmployment                                       = require('../models/UserEmployment');
import UserUrl                                              = require('../models/UserUrl');
import PricingScheme                                        = require('../models/PricingScheme');
import Schedule                                             = require('./Schedule');
import ScheduleRule                                         = require('./ScheduleRule');
import IndustryCode                                         = require('../enums/IndustryCode');
import Salutation                                           = require('../enums/Salutation');
import ForeignKey                                           = require('./ForeignKey');

class User extends BaseModel
{
    static TABLE_NAME:string                                = 'user';

    static TITLE:string                                     = 'title';
    static FIRST_NAME:string                                = 'first_name';
    static MIDDLE_NAME:string                               = 'middle_name';
    static LAST_NAME:string                                 = 'last_name';
    static EMAIL:string                                     = 'email';
    static PASSWORD:string                                  = 'password';
    static PASSWORD_SEED:string                             = 'password_seed'
    static DATE_OF_BIRTH:string                             = 'date_of_birth';
    static INDUSTRY:string                                  = 'industry';
    static TIMEZONE:string                                  = 'timezone';
    static EMAIL_VERIFIED:string                            = 'email_verified';
    static ACTIVE:string                                    = 'active';
    static VERIFIED:string                                  = 'verified';

    static USER_PROFILE:string                              = 'user_profile';
    static SCHEDULE:string                                  = 'schedule';
    static PRICING_SCHEME:string                            = 'pricing_scheme';
    static SCHEDULE_RULE:string                             = 'schedule_rule';

    static DEFAULT_FIELDS:string[] = [User.ID, User.TITLE, User.FIRST_NAME, User.LAST_NAME, User.EMAIL,
        User.INDUSTRY, User.TIMEZONE, User.DATE_OF_BIRTH, User.EMAIL_VERIFIED, User.ACTIVE, User.VERIFIED, User.PASSWORD, User.PASSWORD_SEED];

    constructor(data:Object = {})
    {
        super(data);
        if (!User._INITIALIZED)
        {
            this.hasMany(new ForeignKey(User.ID, UserSkill, UserSkill.USER_ID,'skill'));
            this.hasMany(new ForeignKey(User.ID, UserEducation, UserEducation.USER_ID, 'education'));
            this.hasMany(new ForeignKey(User.ID, UserEmployment, UserEmployment.USER_ID, 'employment'));
            this.hasMany(new ForeignKey(User.ID, UserUrl, UserUrl.USER_ID, 'url'));
            User._INITIALIZED = true;
        }
    }

    private title:Salutation;
    private first_name:string;
    private middle_name:string;
    private last_name:string;
    private email:string;
    private password:string;
    private password_seed:string;
    private date_of_birth:string;
    private industry:IndustryCode;
    private timezone:number;
    private email_verified:boolean;
    private active:boolean;
    private verified:boolean;

    private user_profile:UserProfile;
    private schedule:Schedule[];
    private schedule_rule:ScheduleRule[];
    private pricing_scheme:PricingScheme[];

    /* Getters */
    getTitle():Salutation                                       { return this.title; }
    getFirstName():string                                       { return this.first_name; }
    getMiddleName():string                                      { return this.middle_name; }
    getLastName():string                                        { return this.last_name; }
    getEmail():string                                           { return this.email; }
    getPassword():string                                        { return this.password; }
    getPasswordSeed():string                                    { return this.password_seed; }
    getDateOfBirth():string                                     { return this.date_of_birth; }
    getIndustry():IndustryCode                                  { return this.industry; }
    getTimezone():number                                        { return this.timezone; }
    getEmailVerified():boolean                                  { return this.email_verified; }
    getActive():boolean                                         { return this.active; }
    getVerified():boolean                                       { return this.verified; }

    getUserProfile():UserProfile                                { return this.user_profile; }
    getSchedule():Schedule[]                                    { return this.schedule; }
    getScheduleRule():ScheduleRule[]                            { return this.schedule_rule; }
    getPricingScheme():PricingScheme[]                          { return this.pricing_scheme; }
    getSkill():UserSkill[]                                      { return null; }
    getEducation():UserEducation[]                              { return null; }
    getEmployment():UserEmployment[]                            { return null; }
    getUrl():UserUrl[]                                          { return null; }

    isValid():boolean {
        return !Utils.isNullOrEmpty(this.getEmail()) && validator.isEmail(this.getEmail());
    }

    /* Setters */
    setTitle(val:Salutation)                                    { this.title = val; }
    setFirstName(val:string)                                    { this.first_name = val; }
    setMiddleName(val:string)                                   { this.middle_name = val; }
    setLastName(val:string)                                     { this.last_name = val; }
    setEmail(val:string)                                        { this.email = val; }
    setPassword(val:string)                                     { this.password = val; }
    setPasswordSeed(val:string)                                 { this.password_seed = val; }
    setDateOfBirth(val:string)                                  { this.date_of_birth = val;}
    setIndustry(val:IndustryCode)                               { this.industry = val; }
    setTimezone(val:number)                                     { this.timezone = val; }
    setEmailVerified(val:boolean)                               { this.email_verified = val; }
    setActive(val:boolean)                                      { this.active = val; }
    setVerified(val:boolean)                                    { this.verified = val; }

    setUserProfile(val:UserProfile):void                        { this.user_profile = val; }
    setSchedule(val:Schedule[]):void                            { this.schedule = val; }
    setScheduleRule(val:ScheduleRule[]):void                    { this.schedule_rule = val; }
    setPricingScheme(val:PricingScheme[]):void                  { this.pricing_scheme = val; }
    setSkill(val:UserSkill[])                                   { }
    setEducation(val:UserEducation[])                           { }
    setEmployment(val:UserEmployment[])                         { }
    setUrl(val:UserUrl[])                                       { }

    getPasswordHash(email?:string, password?:string, passwordSeed?:string):string
    {
        var md5sum = crypto.createHash('md5');
        return md5sum.update((email || this.email) + ':' + (password || this.password) + (passwordSeed || this.password_seed || '')).digest('hex');
    }
}
export = User