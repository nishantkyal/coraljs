///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import passport                                             = require('passport');
import connect_ensure_login                                 = require('connect-ensure-login');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserProfileDelegate                                  = require('../delegates/UserProfileDelegate');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiConstants                                         = require('../enums/ApiConstants');
import IntegrationMember                                    = require('../models/IntegrationMember');
import UserProfile                                          = require('../models/UserProfile');

class UserProfileApi
{
    constructor(app, secureApp)
    {
        var userProfileDelegate = new UserProfileDelegate();
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        app.post(ApiUrlDelegate.userProfileFromLinkedIn(), this.putLinkedInFieldsInSession.bind(this), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, {failureRedirect: '/',
            failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));

        app.get(ApiUrlDelegate.userProfileFromLinkedInCallback(), function (req:express.Request, res:express.Response)
        {
            var fetchFields = req.session[ApiConstants.LINKEDIN_FETCH_FIELDS];
            var profileId:number = req.session[ApiConstants.USER_PROFILE_ID];

            userProfileDelegate.get(profileId)
                .then(
                function profileFetched(userProfile:UserProfile)
                {
                    return integrationMemberDelegate.get(userProfile.getIntegrationMemberId())
                        .then(
                        function (integrationMember:IntegrationMember)
                        {
                            var fetchTasks = [];
                            var integration_id:number = integrationMember.getIntegrationId();
                            var userId:number = integrationMember.getUserId();

                            if (fetchFields[ApiConstants.FETCH_PROFILE_PICTURE])
                                fetchTasks.push(userProfileDelegate.fetchProfilePictureFromLinkedIn(userId, integration_id, profileId));

                            if (fetchFields[ApiConstants.FETCH_BASIC])
                                fetchTasks.push(userProfileDelegate.fetchBasicDetailsFromLinkedIn(userId, integration_id, profileId));

                            if (fetchFields[ApiConstants.FETCH_EDUCATION])
                                fetchTasks.push(userProfileDelegate.fetchAndReplaceEducation(userId, integration_id, profileId));

                            if (fetchFields[ApiConstants.FETCH_EMPLOYMENT])
                                fetchTasks.push(userProfileDelegate.fetchAndReplaceEmployment(userId, integration_id, profileId));

                            if (fetchFields[ApiConstants.FETCH_SKILL])
                                fetchTasks.push(userProfileDelegate.fetchAndReplaceSkill(userId, integration_id, profileId));

                            return q.all(fetchTasks);
                        });
                })
                .then(
                function profileFetched(error) { res.send(200); },
                function profileFetchError(error) { res.send(500, error); });
        });

        app.get(ApiUrlDelegate.userProfileById(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);

            userProfileDelegate.get(userProfileId)
                .then(
                function profileFetched(profile) { res.json(profile); },
                function profileFetchError(error) { res.status(500).send(error); }
            );
        });

        app.get(ApiUrlDelegate.userProfile(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];

            userProfileDelegate.search(userProfile)
                .then(
                function profileFetched(profile) { res.json(profile); },
                function profileFetchError(error) { res.status(500).send(error); }
            );
        });

        app.post(ApiUrlDelegate.userProfileById(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];
            var userProfileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);

            userProfileDelegate.update({id: userProfileId}, userProfile)
                .then(
                function profileUpdated(profile) { res.json(profile); },
                function profileUpdateError(error) { res.status(500).send(error); }
            );
        });

        app.put(ApiUrlDelegate.userProfile(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];

            userProfileDelegate.create(userProfile)
                .then(
                function profileCreated(profile) { res.json(profile); },
                function profileCreateError(error) { res.status(500).send(error); }
            );
        });

        app.delete(ApiUrlDelegate.userProfileById(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userProfileId = req.params[ApiConstants.USER_PROFILE_ID];

            userProfileDelegate.delete(userProfileId)
                .then(
                function profileDeleted(profile) { res.json(profile); },
                function profileDeleteError(error) { res.status(500).send(error); }
            );
        });

    }

    private putLinkedInFieldsInSession(req:express.Request, res:express.Response, next:Function)
    {
        req.session[ApiConstants.LINKEDIN_FETCH_FIELDS] = req.body;
        req.session[ApiConstants.USER_PROFILE_ID] = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);
        next();
    }
}
export = UserProfileApi