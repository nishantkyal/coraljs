///<reference path='../_references.d.ts'/>
import validator                                            = require('validator');
import BaseModel                                            = require('./BaseModel')
import Utils                                                = require('../common/Utils');
import Formatter                                            = require('../common/Formatter');
import UserProfile                                          = require('../models/UserProfile');
import IndustryCode                                         = require('../enums/IndustryCode');
import UserStatus                                           = require('../enums/UserStatus');
import Salutation                                           = require('../enums/Salutation');

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
    static TIMEZONE:string = 'timezone';

    static DEFAULT_FIELDS:string[] = [User.ID, User.TITLE, User.FIRST_NAME, User.LAST_NAME, User.EMAIL, User.INDUSTRY, User.TIMEZONE, User.STATUS, User.DATE_OF_BIRTH];

    private title:Salutation;
    private first_name:string;
    private last_name:string;
    private email:string;
    private password:string;
    private status:UserStatus;
    private date_of_birth:string;
    private industry:IndustryCode;
    private timezone:number;

    private user_profile:UserProfile;

    /* Getters */
    getTitle():Salutation                                       { return this.title; }
    getFirstName():string                                       { return this.first_name; }
    getLastName():string                                        { return this.last_name; }
    getEmail():string                                           { return this.email; }
    getPassword():string                                        { return this.password; }
    getStatus():UserStatus                                      { return this.status; }
    getDateOfBirth():string                                     { return this.date_of_birth; }
    getIndustry():IndustryCode                                  { return this.industry; }
    getTimezone():number                                        { return this.timezone; }

    getUserProfile():UserProfile                                { return this.user_profile; }

    isValid():boolean {
        return !Utils.isNullOrEmpty(this.getEmail()) && validator.isEmail(this.getEmail());
    }

    /* Setters */
    setTitle(val:Salutation)                                    { this.title = val; }
    setFirstName(val:string)                                    { this.first_name = val; }
    setLastName(val:string)                                     { this.last_name = val; }
    setEmail(val:string)                                        { this.email = val; }
    setPassword(val:string)                                     { this.password = val; }
    setStatus(val:UserStatus)                                   { this.status = val; }
    setDateOfBirth(val:string)                                  { this.date_of_birth = val;}
    setIndustry(val:IndustryCode)                               { this.industry = val; }
    setTimezone(val:number)                                     { this.timezone = val; }

    setUserProfile(val:UserProfile):void                        { this.user_profile = val; }
}
export = User