import BaseModel                                        = require('./BaseModel');

class UserUrl extends BaseModel
{
    static TABLE_NAME:string = 'user_url';

    static LINKEDIN:string = 'linkedin';
    static FACEBOOK:string = 'facebook';
    static TWITTER:string = 'twitter';
    static TUMBLR:string = 'tumblr';
    static BLOG:string = 'blog';
    static WEBSITE:string = 'website';
    static USER_ID:string = 'user_id';

    static DEFAULT_FIELDS:string[] = [UserUrl.ID,UserUrl.USER_ID, UserUrl.LINKEDIN, UserUrl.FACEBOOK, UserUrl.TWITTER, UserUrl.TUMBLR, UserUrl.BLOG, UserUrl.WEBSITE];

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