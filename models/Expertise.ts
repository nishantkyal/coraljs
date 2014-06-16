import BaseModel                                        = require('../models/BaseModel');

class Expertise extends BaseModel
{
    static TABLE_NAME:string                            = 'user_expertise';

    static USER_ID:string                               = 'user_id';
    static TITLE:string                                 = 'title';
    static PRICING_SCHEME_ID:string                     = 'pricing_scheme_id';
    static DESCRIPTION:string                           = 'description';
    static VIDEO_URL:string                             = 'video_url';
    static OWN_RATING:string                            = 'own_rating';
    static YEARS_OF_EXPERIENCE:string                   = 'years_of_experience';

    static DEFAULT_FIELDS:string[] = [Expertise.ID, Expertise.USER_ID, Expertise.TITLE, Expertise.PRICING_SCHEME_ID, Expertise.DESCRIPTION,
        Expertise.VIDEO_URL, Expertise.OWN_RATING, Expertise.YEARS_OF_EXPERIENCE];

    private user_id:number;
    private title:string;
    private pricing_scheme_id:number;
    private description:string;
    private video_url:string;
    private own_rating:number;
    private years_of_experience:number;
    
    /* Getters */
    getUserId():number                                  { return this.user_id; }
    getTitle():string                                   { return this.title; }
    getPricingSchemeId():number                         { return this.pricing_scheme_id; }
    getDescription():string                             { return this.description; }
    getVideoUrl():string                                { return this.video_url; }
    getOwnRating():number                               { return this.own_rating; }
    getYearsOfExperience():number                       { return this.years_of_experience; }

    /* Setters */
    setUserId(val:number)                               { this.user_id = val; }
    setTitle(val:string)                                { this.title = val; }
    setPricingSchemeId(val:number)                      { this.pricing_scheme_id = val; }
    setDescription(val:string)                          { this.description = val; }
    setVideoUrl(val:string)                             { this.video_url = val; }
    setOwnRating(val:number)                            { this.own_rating = val; }
    setYearsOfExperience(val:number)                    { this.years_of_experience = val; }
}
export = Expertise