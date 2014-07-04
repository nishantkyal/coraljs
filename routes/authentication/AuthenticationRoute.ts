import _                                            = require('underscore');
import q                                            = require('q');
import passport                                     = require('passport');
import express                                      = require('express');
import AuthenticationDelegate                       = require('../../delegates/AuthenticationDelegate');
import UserProfileDelegate                          = require('../../delegates/UserProfileDelegate');
import ApiConstants                                 = require('../../enums/ApiConstants');
import User                                         = require('../../models/User');
import Urls                                         = require('./Urls');
import DashboardUrls                                = require('../dashboard/Urls');

class AuthenticationRoute
{
    private static PAGE_LOGIN:string = 'dashboard/login';
    private static PAGE_REGISTER:string = 'dashboard/register';

    private userProfileDelegate = new UserProfileDelegate();

    constructor(app, secureApp)
    {
        // Pages
        app.get(Urls.login(), this.login.bind(this));
        app.get(Urls.register(), this.register.bind(this));

        // Auth
        app.get(Urls.checkLogin(), AuthenticationDelegate.checkLogin({justCheck: true}));
        app.post(Urls.login(), AuthenticationDelegate.login(), this.authSuccess.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register(), this.authSuccess.bind(this));
        app.get(Urls.linkedInLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN, {failureRedirect: Urls.login(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));
        app.get(Urls.linkedInLoginCallBack(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN, {failureRedirect: Urls.login(), failureFlash: true}), this.linkedInCallBack.bind(this), this.authSuccess.bind(this));
        app.get(Urls.logout(), this.logout.bind(this));

    }

    /* Login page */
    private login(req, res:express.Response)
    {
        var pageData = {
            messages: req.flash()
        };

        res.render(AuthenticationRoute.PAGE_LOGIN, pageData);
    }

    /* Register page */
    private register(req, res:express.Response)
    {
        var pageData = {
            messages: req.flash()
        };

        res.render(AuthenticationRoute.PAGE_REGISTER, pageData);
    }

    /**
     * Authentication Success page
     * Renders integrations page by default after fetching all network member entries for the user
     * Returns to returnTo, if set in session
     */
    private authSuccess(req, res:express.Response, next:Function)
    {
        var isAjax = req.get('content-type') && req.get('content-type').indexOf('application/json') != -1;
        var returnToUrl:string = req.session[ApiConstants.RETURN_TO];

        if (isAjax)
            res.json(200, {valid: true});
        else if (returnToUrl)
        {
            req.session[ApiConstants.RETURN_TO] = null;
            res.redirect(returnToUrl);
        }
        else
            res.redirect(DashboardUrls.dashboard());
    }

    /* Logout and redirect to login page */
    private logout(req, res:express.Response)
    {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        req.logout();
        res.clearCookie("connect.sid");
        var returnToUrl:string = req.query[ApiConstants.RETURN_TO] || Urls.login();
        res.redirect(returnToUrl);;
    }

    private linkedInCallBack(req:express.Request, res:express.Response, next:Function)
    {
        var self = this;

        var fetchFields = (req.cookies[ApiConstants.LINKEDIN_FETCH_FIELDS] || '').split(',');
        var profileId:number = req.cookies[ApiConstants.USER_PROFILE_ID];
        var userId:number = new User(req.session[ApiConstants.USER]).getId();

        res.clearCookie(ApiConstants.LINKEDIN_FETCH_FIELDS);

        q.all(_.map(fetchFields, function(field)
        {
            switch(field)
            {
                case ApiConstants.FETCH_PROFILE_PICTURE:
                    return self.userProfileDelegate.fetchProfilePictureFromLinkedIn(userId, profileId);

                case ApiConstants.FETCH_BASIC:
                    return self.userProfileDelegate.fetchBasicDetailsFromLinkedIn(userId, profileId);

                case ApiConstants.FETCH_EDUCATION:
                    return self.userProfileDelegate.fetchAndReplaceEducation(userId, profileId);

                case ApiConstants.FETCH_EMPLOYMENT:
                    return self.userProfileDelegate.fetchAndReplaceEmployment(userId, profileId);

                case ApiConstants.FETCH_SKILL:
                    return self.userProfileDelegate.fetchAndReplaceSkill(userId, profileId);
            }
        }))
            .then(
            function profileFetched()
            {
                next();
            },
            function fetchError(error:Error)
            {
                req.flash('User profile sync with LinkedIn failed. Error: %s', error.message);
                next();
            });
    }
}
export = AuthenticationRoute