import passport                                     = require('passport');
import express                                      = require('express');
import AuthenticationDelegate                       = require('../../delegates/AuthenticationDelegate');

import Urls                                         = require('./Urls');

class AuthenticationRoute
{
    constructor(app, secureApp)
    {
        app.get(Urls.login())

        app.post(Urls.login(), AuthenticationDelegate.login(), this.authenticationSuccess.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register(), this.authenticationSuccess.bind(this));
        app.post(Urls.fbLogin(), AuthenticationDelegate.register(), this.authenticationSuccess.bind(this));
        app.post(Urls.fbLoginCallBack(), AuthenticationDelegate.register(), this.authenticationSuccess.bind(this));
        app.post(Urls.linkedInLogin(), AuthenticationDelegate.register(), this.authenticationSuccess.bind(this));
        app.post(Urls.linkedinLoginCallBack(), AuthenticationDelegate.register(), this.authenticationSuccess.bind(this));
    }

    private authenticationSuccess(req:express.Request, res: express.Response)
    {
        var isAjax = req.get('content-type') && req.get('content-type').indexOf('application/json') != -1;

    }
}
export = AuthenticationRoute