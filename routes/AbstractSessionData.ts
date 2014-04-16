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

        if (req[ApiConstants.USER])
            this.data[AbstractSessionData.LOGGED_IN_USER] = new User(req[ApiConstants.USER]);
    }

    /* Getters */
    getIdentifier():string                      { return 'PLEASE_SET_THIS_VALUE'; }
    getLoggedInUser():User                      { return this.data[AbstractSessionData.LOGGED_IN_USER]; }
    getData():Object                            { return this.data; }

    /* Setters */
    set(key:string, val:Object)
    {
        this.data[key] = val;
        this.req.session[this.getIdentifier()] = this.data;
    }
}
export = AbstractSessionData