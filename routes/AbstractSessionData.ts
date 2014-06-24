import ApiConstants                                         = require('../enums/ApiConstants');
import User                                                 = require('../models/User');
import Config                                               = require('../common/Config');
import Credentials                                          = require('../common/Credentials');

class AbstractSessionData
{
    private static LOGGED_IN_USER:string                    = 'loggedInUser';
    private static GOOGLE_ANALYTICS_TRACKING_ID:string      = 'googleAnalyticsTrackingId';

    private req;
    private data:Object;

    constructor(req)
    {
        this.data = this.data || req.session[this.getIdentifier()] || {};
        this.data[AbstractSessionData.GOOGLE_ANALYTICS_TRACKING_ID] = Credentials.get(Credentials.GOOGLE_ANALYTICS_TRACKING_ID);
        this.req = req;
    }

    /* Getters */
    getIdentifier():string { throw('Implement this method'); }

    getLoggedInUser():User
    {
        if (this.req[ApiConstants.USER])
        {
            var user = new User(this.req[ApiConstants.USER]);
            if (user.isValid())
                return user;
        }

        return this.req[ApiConstants.USER];
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

    clear():void
    {
        this.data = {};
    }
}
export = AbstractSessionData