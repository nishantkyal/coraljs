import BaseModel                = require('./BaseModel');
import IntegrationType          = require('../enums/IntegrationType');

/**
 Bean class for Integration
**/
class Integration extends BaseModel
{
    static TABLE_NAME:string = 'integration';

    static TITLE:string = 'title';
    static WEBSITE_URL:string = 'website_url';
    static REDIRECT_URL:string = 'redirect_url';
    static INTEGRATION_TYPE:string = 'integration_type';
    static SECRET:string = 'secret';
    static STATUS:string = 'status';

    private title:string;
    private website_url:string;
    private redirect_url:string;
    private integration_type:IntegrationType;
    private secret:string;
    private status:string;

    /** Getters */
    getTitle():string { return this.title; }
    getWebsiteUrl():string { return this.website_url; }
    getRedirectUrl():string { return this.redirect_url; }
    getIntegrationType():IntegrationType { return this.integration_type; }
    getSecret():string { return this.secret; }
    getStatus():string { return this.status; }

    /** Setters */
    setTitle(val:string) { this.title = val; }
    setWebsiteUrl(val:string) { this.website_url = val; }
    setRedirectUrl(val:string) { this.redirect_url = val; }
    setIntegrationType(val:IntegrationType) { this.integration_type = val; }
    setSecret(val:string) { this.secret = val; }
    setStatus(val:string) { this.status = val; }

}
export = Integration