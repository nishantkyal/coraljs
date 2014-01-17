import BaseModel = require('./BaseModel')

/**
 Bean class for Integration
**/
class Integration extends BaseModel {

    static TABLE_NAME:string = 'integration';

    private title:string;
    private website_url:string;
    private redirect_url:string;
    private integration_type:string;
    private secret:string;
    private status:string;

    /** Getters */
    getTitle():string { return this.title; }
    getWebsiteUrl():string { return this.website_url; }
    getRedirectUrl():string { return this.redirect_url; }
    getType():string { return this.integration_type; }
    getSecret():string { return this.secret; }
    getStatus():string { return this.status; }

    /** Setters */
    setTitle(val:string) { this.title = val; }
    setWebsiteUrl(val:string) { this.website_url = val; }
    setRedirectUrl(val:string) { this.redirect_url = val; }
    setType(val:string) { this.integration_type = val; }
    setSecret(val:string) { this.secret = val; }
    setStatus(val:string) { this.status = val; }

}
export = Integration