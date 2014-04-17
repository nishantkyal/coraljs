import ApiConstants                                         = require('../enums/ApiConstants');
import User                                                 = require('../models/User');

class AbstractSessionData
{
    private static LOGGED_IN_USER:string    = 'loggedInUser';

    private req;
    private data:Object;

    constructor(req)
    {
        this.data = this.data || req.session[this.getIdentifier()] || {};
        this.req = req;
    }

    /* Getters */
    getIdentifier():string                      { throw('Implement this method'); }

    getLoggedInUser():User
    {
        try {
            return new User(this.req[ApiConstants.USER]);
        } catch(e) {
            return this.req[ApiConstants.USER];
        }
    }

    getData():Object
    {
        this.data[AbstractSessionData.LOGGED_IN_USER] = this.getLoggedInUser();
        return JSON.parse(JSON.stringify(this.data));
    }

    /* Setters */
    set(key:string, val:Object)
    {
        this.data[key] = val;
        this.req.session[this.getIdentifier()] = this.data;
    }
}
export = AbstractSessionData