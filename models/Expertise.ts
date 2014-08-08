import q                                                = require('q');
import BaseModel                                        = require('../models/BaseModel');
import MapExpertiseSkill                                = require('../models/MapExpertiseSkill');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import ForeignKeyType                                   = require('../enums/ForeignKeyType');
import ForeignKey                                       = require('./ForeignKey');

class Expertise extends BaseModel
{
    static TABLE_NAME:string                                = 'user_expertise';

    static COL_USER_ID:string                               = 'user_id';
    static COL_TITLE:string                                 = 'title';
    static COL_PULSE_RATE:string                            = 'pulse_rate';
    static COL_CHARGING_RATE:string                         = 'charging_rate';
    static COL_UNIT:string                                  = 'unit';
    static COL_DESCRIPTION:string                           = 'description';
    static COL_VIDEO_URL:string                             = 'video_url';
    static COL_OWN_RATING:string                            = 'own_rating';
    static COL_YEARS_OF_EXPERIENCE:string                   = 'years_of_experience';

    static FK_EXPERTISE_SKILL = new ForeignKey(ForeignKeyType.MANY_TO_MANY, Expertise.COL_ID, MapExpertiseSkill, MapExpertiseSkill.COL_EXPERTISE_ID, 'skills');

    static PUBLIC_FIELDS:string[] = [Expertise.COL_ID, Expertise.COL_USER_ID, Expertise.COL_TITLE, Expertise.COL_PULSE_RATE,
        Expertise.COL_CHARGING_RATE, Expertise.COL_UNIT, Expertise.COL_DESCRIPTION, Expertise.COL_VIDEO_URL,
        Expertise.COL_OWN_RATING, Expertise.COL_YEARS_OF_EXPERIENCE];

    private user_id:number;
    private title:string;
    private pulse_rate:number;
    private charging_rate:number;
    private unit:MoneyUnit;
    private description:string;
    private video_url:string;
    private own_rating:number;
    private years_of_experience:number;

    /* Getters */
    getUserId():number                                  { return this.user_id; }
    getTitle():string                                   { return this.title; }
    getPulseRate():number                               { return this.pulse_rate; }
    getChargingRate():number                            { return this.charging_rate; }
    getUnit():MoneyUnit                                 { return this.unit; }
    getDescription():string                             { return this.description; }
    getVideoUrl():string                                { return this.video_url; }
    getOwnRating():number                               { return this.own_rating; }
    getYearsOfExperience():number                       { return this.years_of_experience; }
    getSkills():q.Promise<MapExpertiseSkill[]>          { return null; }

    /* Setters */
    setUserId(val:number)                               { this.user_id = val; }
    setTitle(val:string)                                { this.title = val; }
    setPulseRate(val:number)                            { this.pulse_rate = val; }
    setChargingRate(val:number)                         { this.charging_rate = val; }
    setUnit(val:MoneyUnit)                              { this.unit = val; }
    setDescription(val:string)                          { this.description = val; }
    setVideoUrl(val:string)                             { this.video_url = val; }
    setOwnRating(val:number)                            { this.own_rating = val; }
    setYearsOfExperience(val:number)                    { this.years_of_experience = val; }
    setSkills(val:MapExpertiseSkill[])                  {  }
}
export = Expertise