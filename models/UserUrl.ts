import BaseModel                                        = require('./BaseModel');

class UserUrl extends BaseModel
{
    static TABLE_NAME:string = 'user_url';

    static COL_LINKEDIN:string = 'linkedin';
    static COL_FACEBOOK:string = 'facebook';
    static COL_TWITTER:string = 'twitter';
    static COL_TUMBLR:string = 'tumblr';
    static COL_BLOG:string = 'blog';
    static COL_WEBSITE:string = 'website';
    static COL_USER_ID:string = 'user_id';

    static DEFAULT_FIELDS:string[] = [UserUrl.COL_ID, UserUrl.COL_USER_ID, UserUrl.COL_LINKEDIN, UserUrl.COL_FACEBOOK, UserUrl.COL_TWITTER, UserUrl.COL_TUMBLR, UserUrl.COL_BLOG, UserUrl.COL_WEBSITE];

    private linkedin:string;
    private facebook:string;
    private twitter:string;
    private tumblr:string;
    private blog:string;
    private website:string;
    private user_id:number;

    /* Getters */
    getLinkedin():string        { return this.linkedin; }
    getFacebook():string        { return this.facebook; }
    getTwitter():string         { return this.twitter; }
    getTumblr():string          { return this.tumblr; }
    getBlog():string            { return this.blog; }
    getwebsite():string         { return this.website; }
    getUserId():number          { return this.user_id; }

    /* Setters */
    setLinkedin(val:string)     { this.linkedin = val; }
    setFacebook(val:string)     { this.facebook = val; }
    setTwitter(val:string)      { this.twitter = val; }
    setTumblr(val:string)       { this.tumblr = val; }
    setBlog(val:string)         { this.blog = val; }
    setWebsite(val:string)      { this.website = val; }
    setUserId(val:number):void      { this.user_id = val; }
}
export = UserUrl