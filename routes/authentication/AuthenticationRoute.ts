import passport                                     = require('passport');
import express                                      = require('express');
import AuthenticationDelegate                       = require('../../delegates/AuthenticationDelegate');

import Urls                                         = require('./Urls');

class AuthenticationRoute
{
    constructor(app, secureApp)
    {
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN), this.login.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register(), this.login.bind(this));
        app.post(Urls.fbLogin(), AuthenticationDelegate.register(), this.login.bind(this));
        app.post(Urls.fbLoginCallBack(), AuthenticationDelegate.register(), this.login.bind(this));
        app.post(Urls.linkedInLogin(), AuthenticationDelegate.register(), this.login.bind(this));
        app.post(Urls.linkedinLoginCallBack(), AuthenticationDelegate.register(), this.login.bind(this));
    }

    private login(req:express.Request, res: express.Response)
    {

    }
}
export = AuthenticationRoute