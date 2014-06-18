import BaseModel                                        = require('../models/BaseModel');
import MoneyUnit                                        = require('../enums/MoneyUnit');

class Expertise extends BaseModel
{
    static TABLE_NAME:string                            = 'user_expertise';

    static USER_ID:string                               = 'user_id';
    static TITLE:string                                 = 'title';
    static SESSION_DURATION:string                      = 'session_duration';
    static SESSION_PRICE:string                         = 'session_price';
    static SESSION_PRICE_UNIT:string                    = 'session_price_unit';
    static DESCRIPTION:string                           = 'description';
    static VIDEO_URL:string                             = 'video_url';
    static OWN_RATING:string                            = 'own_rating';
    static YEARS_OF_EXPERIENCE:string                   = 'years_of_experience';

    static DEFAULT_FIELDS:string[] = [Expertise.ID, Expertise.USER_ID, Expertise.TITLE, Expertise.SESSION_DURATION,
        Expertise.SESSION_PRICE, Expertise.SESSION_PRICE_UNIT, Expertise.DESCRIPTION, Expertise.VIDEO_URL,
        Expertise.OWN_RATING, Expertise.YEARS_OF_EXPERIENCE];

    private user_id:number;
    private title:string;
    private session_duration:number;
    private session_price:number;
    private session_price_unit:MoneyUnit;
    private description:string;
    private video_url:string;
    private own_rating:number;
    private years_of_experience:number;
    
    /* Getters */
    getUserId():number                                  { return this.user_id; }
    getTitle():string                                   { return this.title; }
    getSessionDuration():number                         { return this.session_duration; }
    getSessionPrice():number                            { return this.session_price; }
    getSessionPriceUnit():MoneyUnit                     { return this.session_price_unit; }
    getDescription():string                             { return this.description; }
    getVideoUrl():string                                { return this.video_url; }
    getOwnRating():number                               { return this.own_rating; }
    getYearsOfExperience():number                       { return this.years_of_experience; }

    /* Setters */
    setUserId(val:number)                               { this.user_id = val; }
    setTitle(val:string)                                { this.title = val; }
    setSessionDuration(val:number)                      { this.session_duration = val; }
    setSessionPrice(val:number)                         { this.session_price = val; }
    setSessionPriceUnit(val:MoneyUnit)                  { this.session_price_unit = val; }
    setDescription(val:string)                          { this.description = val; }
    setVideoUrl(val:string)                             { this.video_url = val; }
    setOwnRating(val:number)                            { this.own_rating = val; }
    setYearsOfExperience(val:number)                    { this.years_of_experience = val; }
}
export = Expertise