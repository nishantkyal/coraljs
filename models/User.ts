import q                                                    = require('q');
import crypto                                               = require('crypto');
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
import ForeignKeyType                                       = require('../enums/ForeignKeyType');
import ForeignKey                                           = require('./ForeignKey');

class User extends BaseModel
{
    static TABLE_NAME:string                                = 'user';

    static COL_TITLE:string                                     = 'title';
    static COL_FIRST_NAME:string                                = 'first_name';
    static COL_MIDDLE_NAME:string                               = 'middle_name';
    static COL_LAST_NAME:string                                 = 'last_name';
    static COL_EMAIL:string                                     = 'email';
    static COL_PASSWORD:string                                  = 'password';
    static COL_PASSWORD_SEED:string                             = 'password_seed'
    static COL_DATE_OF_BIRTH:string                             = 'date_of_birth';
    static COL_INDUSTRY:string                                  = 'industry';
    static COL_TIMEZONE:string                                  = 'timezone';
    static COL_EMAIL_VERIFIED:string                            = 'email_verified';
    static COL_ACTIVE:string                                    = 'active';
    static COL_VERIFIED:string                                  = 'verified';

    static PUBLIC_FIELDS:string[] = [User.COL_ID, User.COL_TITLE, User.COL_FIRST_NAME, User.COL_LAST_NAME, User.COL_EMAIL,
        User.COL_INDUSTRY, User.COL_TIMEZONE, User.COL_DATE_OF_BIRTH, User.COL_EMAIL_VERIFIED, User.COL_ACTIVE, User.COL_VERIFIED, User.COL_PASSWORD, User.COL_PASSWORD_SEED];

    static FK_USER_PROFILE = new ForeignKey(ForeignKeyType.ONE_TO_MANY, User.COL_ID, UserProfile, UserProfile.COL_USER_ID, 'profile');
    static FK_USER_SKILL = new ForeignKey(ForeignKeyType.ONE_TO_MANY, User.COL_ID, UserSkill, UserSkill.COL_USER_ID, 'skills');
    static FK_USER_EDUCATION = new ForeignKey(ForeignKeyType.ONE_TO_MANY, User.COL_ID, UserEducation, UserEducation.COL_USER_ID, 'education');
    static FK_USER_EMPLOYMENT = new ForeignKey(ForeignKeyType.ONE_TO_MANY, User.COL_ID, UserEmployment, UserEmployment.COL_USER_ID, 'employment');
    static FK_USER_URL = new ForeignKey(ForeignKeyType.ONE_TO_MANY, User.COL_ID, UserUrl, UserUrl.COL_USER_ID, 'url');
    static FK_USER_PRICING_SCHEME = new ForeignKey(ForeignKeyType.ONE_TO_MANY, User.COL_ID, PricingScheme, PricingScheme.COL_USER_ID, 'pricing_schemes');
    static FK_USER_SCHEDULE_RULE = new ForeignKey(ForeignKeyType.ONE_TO_MANY, User.COL_ID, ScheduleRule, ScheduleRule.COL_USER_ID, 'schedule_rules');

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
    getUserProfile():q.Promise<UserProfile>                     { return null; }
    getScheduleRule():q.Promise<ScheduleRule[]>                 { return null; }
    getPricingScheme():q.Promise<PricingScheme[]>               { return null; }
    getSkill():q.Promise<UserSkill[]>                           { return null; }
    getEducation():q.Promise<UserEducation[]>                   { return null; }
    getEmployment():q.Promise<UserEmployment[]>                 { return null; }
    getUrl():q.Promise<UserUrl[]>                               { return null; }

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
    setUserProfile(val:UserProfile):void                        { }
    setScheduleRules(val:ScheduleRule[]):void                   { }
    setPricingSchemes(val:PricingScheme[]):void                 { }
    setSkills(val:UserSkill[])                                  { }
    setEducation(val:UserEducation[])                           { }
    setEmployment(val:UserEmployment[])                         { }
    setUrl(val:UserUrl[])                                       { }

    getPasswordHash(email?:string, password?:string, passwordSeed?:string):string
    {
        var md5sum = crypto.createHash('md5');
        return md5sum.update((email || this.email) + ':' + (password || this.password) + (passwordSeed || this.password_seed || '')).digest('hex');
    }

    isCurrentlyAvailable(schedules:Schedule[]):boolean
    {
        var currentTime = moment().valueOf();
        var nextAvailableSchedule:Schedule = this.getNextAvailableSchedule(schedules);

        return !Utils.isNullOrEmpty(nextAvailableSchedule) ?
                (currentTime > nextAvailableSchedule.getStartTime() && currentTime < (nextAvailableSchedule.getStartTime() + nextAvailableSchedule.getDuration()))
            : false;
    }

    getNextAvailableSchedule(schedules:Schedule[]):Schedule
    {
        if (schedules)
            return _.find(schedules, function (schedule:Schedule):boolean
            {
                var scheduleEndTime = schedule.getStartTime() + schedule.getDuration();
                return scheduleEndTime > moment().add({minutes: 15}).valueOf();
            });
        else
            return null;
    }
}
export = User