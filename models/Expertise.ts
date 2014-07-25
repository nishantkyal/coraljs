import BaseModel                                        = require('../models/BaseModel');
import MapExpertiseSkill                                = require('../models/MapExpertiseSkill');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import ForeignKey                                       = require('./ForeignKey');


class Expertise extends BaseModel
{
    static TABLE_NAME:string                            = 'user_expertise';

    static COL_USER_ID:string                               = 'user_id';
    static COL_TITLE:string                                 = 'title';
    static COL_SESSION_DURATION:string                      = 'session_duration';
    static COL_SESSION_PRICE:string                         = 'session_price';
    static COL_SESSION_PRICE_UNIT:string                    = 'session_price_unit';
    static COL_DESCRIPTION:string                           = 'description';
    static COL_VIDEO_URL:string                             = 'video_url';
    static COL_OWN_RATING:string                            = 'own_rating';
    static COL_YEARS_OF_EXPERIENCE:string                   = 'years_of_experience';

    constructor(data:Object = {})
    {
        super(data);
        if (!Expertise._INITIALIZED)
        {
            this.hasMany(new ForeignKey(Expertise.COL_ID, MapExpertiseSkill, MapExpertiseSkill.COL_EXPERTISE_ID, 'skill'));
            Expertise._INITIALIZED = true;
        }
    }

    static DEFAULT_FIELDS:string[] = [Expertise.COL_ID, Expertise.COL_USER_ID, Expertise.COL_TITLE, Expertise.COL_SESSION_DURATION,
        Expertise.COL_SESSION_PRICE, Expertise.COL_SESSION_PRICE_UNIT, Expertise.COL_DESCRIPTION, Expertise.COL_VIDEO_URL,
        Expertise.COL_OWN_RATING, Expertise.COL_YEARS_OF_EXPERIENCE];

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

    getSkill():MapExpertiseSkill[]                     { return null; }

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

    setSkill(val:MapExpertiseSkill[])                  {  }
}
export = Expertise