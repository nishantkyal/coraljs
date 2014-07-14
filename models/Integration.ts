import BaseModel                = require('./BaseModel');
import IntegrationStatus        = require('../enums/IntegrationStatus');

/*
 Bean class for Integration
*/
class Integration extends BaseModel
{
    static TABLE_NAME:string = 'integration';

    static TITLE:string = 'title';
    static WEBSITE_URL:string = 'website_url';
    static REDIRECT_URL:string = 'redirect_url';
    static SECRET:string = 'secret';
    static STATUS:string = 'status';

    private title:string;
    private website_url:string;
    private redirect_url:string;
    private secret:string;
    private status:IntegrationStatus;

    static DEFAULT_FIELDS:string[] = [Integration.ID, Integration.TITLE, Integration.WEBSITE_URL, Integration.REDIRECT_URL];

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