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

    static DEFAULT_FIELDS:string[] = [UserUrl.ID, UserUrl.LINKEDIN, UserUrl.FACEBOOK, UserUrl.TWITTER, UserUrl.TUMBLR, UserUrl.BLOG, UserUrl.WEBSITE];

    private linkedin:string;
    private facebook:string;
    private twitter:string;
    private tumblr:string;
    private blog:string;
    private website:string;

    /* Getters */
    getLinkedin():string        { return this.linkedin; }
    getFacebook():string        { return this.facebook; }
    getTwitter():string         { return this.twitter; }
    getTumblr():string          { return this.tumblr; }
    getBlog():string            { return this.blog; }
    getwebsite():string         { return this.website; }

    /* Setters */
    setLinkedin(val:string)     { this.linkedin = val; }
    setFacebook(val:string)     { this.facebook = val; }
    setTwitter(val:string)      { this.twitter = val; }
    setTumblr(val:string)       { this.tumblr = val; }
    setBlog(val:string)         { this.blog = val; }
    setWebsite(val:string)      { this.website = val; }
}
export = UserUrl