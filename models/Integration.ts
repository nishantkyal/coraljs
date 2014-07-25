import BaseModel                = require('./BaseModel');
import IntegrationStatus        = require('../enums/IntegrationStatus');

/*
 Bean class for Integration
*/
class Integration extends BaseModel
{
    static TABLE_NAME:string = 'integration';

    static COL_TITLE:string = 'title';
    static COL_WEBSITE_URL:string = 'website_url';
    static COL_REDIRECT_URL:string = 'redirect_url';
    static COL_SECRET:string = 'secret';
    static COL_STATUS:string = 'status';

    private title:string;
    private website_url:string;
    private redirect_url:string;
    private secret:string;
    private status:IntegrationStatus;

    static PUBLIC_FIELDS:string[] = [Integration.COL_ID, Integration.COL_TITLE, Integration.COL_WEBSITE_URL, Integration.COL_REDIRECT_URL];

    /* Getters */
    getTitle():string                                   { return this.title; }
    getWebsiteUrl():string                              { return this.website_url; }
    getRedirectUrl():string                             { return this.redirect_url; }
    getSecret():string                                  { return this.secret; }
    getStatus():IntegrationStatus                       { return this.status; }

    /* Setters */
    setTitle(val:string)                                { this.title = val; }
    setWebsiteUrl(val:string)                           { this.website_url = val; }
    setRedirectUrl(val:string)                          { this.redirect_url = val; }
    setSecret(val:string)                               { this.secret = val; }
    setStatus(val:IntegrationStatus)                    { this.status = val; }

}
export = Integration