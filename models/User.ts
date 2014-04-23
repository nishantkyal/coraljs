///<reference path='../_references.d.ts'/>
import validator                                            = require('validator');
import BaseModel                                            = require('./BaseModel')
import Utils                                                = require('../common/Utils');
import UserProfile                                          = require('../models/UserProfile');
import IndustryCode                                         = require('../enums/IndustryCode');
import UserStatus                                           = require('../enums/UserStatus');

class User extends BaseModel
{
    static TABLE_NAME:string = 'user';

    static TITLE:string = 'title';
    static FIRST_NAME:string = 'first_name';
    static LAST_NAME:string = 'last_name';
    static EMAIL:string = 'email';
    static PASSWORD:string = 'password';
    static STATUS:string = 'status';
    static USER_PROFILE:string = 'user_profile';
    static DATE_OF_BIRTH:string = 'date_of_birth';
    static INDUSTRY:string = 'industry';
    static LOCATION:string = 'location';
    static TIMEZONE:string = 'timezone';
    static DEFAULT_PROFILE_ID:string = 'default_profile_id';

    static DEFAULT_FIELDS:string[] = [User.ID, User.FIRST_NAME, User.LAST_NAME, User.EMAIL, User.INDUSTRY, User.LOCATION, User.STATUS, User.DATE_OF_BIRTH, User.DEFAULT_PROFILE_ID];
    private title:string;
    private first_name:string;
    private last_name:string;
    private email:string;
    private password:string;
    private status:UserStatus;
    private date_of_birth:string;
    private industry:IndustryCode;
    private location:string;
    private timezone:string;
    private default_profile_id:number;

    private user_profile:UserProfile;

    /* Getters */
    getTitle():string                                           { return this.title; }
    getFirstName():string                                       { return this.first_name; }
    getLastName():string                                        { return this.last_name; }
    getEmail():string                                           { return this.email; }
    getPassword():string                                        { return this.password; }
    getStatus():UserStatus                                      { return this.status; }
    getDateOfBirth():string                                     { return this.date_of_birth; }
    getIndustry():IndustryCode                                  { return this.industry; }
    getLocation():string                                        { return this.location; }
    getTimezone():string                                        { return this.timezone; }
    getDefaultProfileId():number                                { return this.default_profile_id; }

    getUserProfile():UserProfile                                { return this.user_profile; }

    isValid():boolean {
        return !Utils.isNullOrEmpty(this.getEmail()) && validator.isEmail(this.getEmail());
    }

    /* Setters */
    setTitle(val:string)                                        { this.title = val; }
    setFirstName(val:string)                                    { this.first_name = val; }
    setLastName(val:string)                                     { this.last_name = val; }
    setEmail(val:string)                                        { this.email = val; }
    setPassword(val:string)                                     { this.password = val; }
    setStatus(val:UserStatus)                                   { this.status = val; }
    setDateOfBirth(val:string)                                  { this.date_of_birth = val;}
    setIndustry(val:IndustryCode)                               { this.industry = val; }
    setLocation(val:string)                                     { this.location = val; }
    setTimezone(val:string)                                     { this.timezone = val; }
    setDefaultProfileId(val:number)                             { this.default_profile_id = val; }

    setUserProfile(val:UserProfile):void                        { this.user_profile = val; }

}
export = User