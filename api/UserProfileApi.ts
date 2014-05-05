///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import express                                              = require('express');
import passport                                             = require('passport');
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

        app.get(ApiUrlDelegate.userProfileFromLinkedInCallback(), function(req:express.Request, res:express.Response)
        {
            var fetchFields = req.session[ApiConstants.LINKEDIN_FETCH_FIELDS];
            var profileId:number = req.session[ApiConstants.USER_PROFILE_ID];

            userProfileDelegate.get(profileId)
                .then( function profileFetched(userProfile:UserProfile)
                {
                    integrationMemberDelegate.get(userProfile.getIntegrationMemberId())
                        .then( function(integrationMember:IntegrationMember){
                            var fetchTasks = [];
                            var integration_id:number = integrationMember.getIntegrationId();
                            var userId:number = integrationMember.getUserId();
                            if(fetchFields[ApiConstants.FETCH_PROFILE_PICTURE])
                            {
                                fetchTasks.push(userProfileDelegate.fetchProfilePictureFromLinkedIn(userId,integration_id, profileId));
                            }
                            if(fetchFields[ApiConstants.FETCH_BASIC])
                            {
                                fetchTasks.push(userProfileDelegate.fetchBasicDetailsFromLinkedIn(userId, integration_id, profileId));
                            }
                            if(fetchFields[ApiConstants.FETCH_EDUCATION])
                            {
                                fetchTasks.push(userProfileDelegate.fetchAndReplaceEducation(userId, integration_id, profileId));
                            }
                            if(fetchFields[ApiConstants.FETCH_EMPLOYMENT])
                            {
                                fetchTasks.push(userProfileDelegate.fetchAndReplaceEmployment(userId, integration_id, profileId));
                            }
                            if(fetchFields[ApiConstants.FETCH_SKILL])
                            {
                                fetchTasks.push(userProfileDelegate.fetchAndReplaceSkill(userId, integration_id, profileId));
                            }
                            q.all(fetchTasks)
                                .then(
                                    function profileFetched(){ res.status(200); },
                                    function fetchError(error){ res.status(500); }
                                )
                        })
                }),
                function profileFetchError(error)
                {
                    res.status(500).send(error);
                }
        });

        app.get(ApiUrlDelegate.userProfileById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var userProfileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);

            userProfileDelegate.get(userProfileId)
                .then(
                    function profileFetched(profile) { res.json(profile); },
                    function profileFetchError(error) { res.status(500).send(error); }
                );
        });

        app.get(ApiUrlDelegate.userProfile(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];

            userProfileDelegate.search(userProfile)
                .then(
                    function profileFetched(profile) { res.json(profile); },
                    function profileFetchError(error) { res.status(500).send(error); }
                );
        });

        app.post(ApiUrlDelegate.userProfileById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];
            var userProfileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);

            userProfileDelegate.update({id: userProfileId}, userProfile)
                .then(
                function profileUpdated(profile) { res.json(profile); },
                function profileUpdateError(error) { res.status(500).send(error); }
            );
        });

        app.put(ApiUrlDelegate.userProfile(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var userProfile = req.body[ApiConstants.USER_PROFILE];

            userProfileDelegate.create(userProfile)
                .then(
                function profileCreated(profile) { res.json(profile); },
                function profileCreateError(error) { res.status(500).send(error); }
            );
        });

        app.delete(ApiUrlDelegate.userProfileById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
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
        var profileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);
        var fetchBasic:boolean = req.body[ApiConstants.FETCH_BASIC] == 'on' ? true :false;
        var fetchEducation:boolean = req.body[ApiConstants.FETCH_EDUCATION] == 'on' ? true :false;
        var fetchEmployment:boolean = req.body[ApiConstants.FETCH_EMPLOYMENT] == 'on' ? true :false;
        var fetchProfilePicture:boolean = req.body[ApiConstants.FETCH_PROFILE_PICTURE] == 'on' ? true :false;
        var fetchSkill:boolean = req.body[ApiConstants.FETCH_SKILL] == 'on' ? true :false;
        req.session[ApiConstants.LINKEDIN_FETCH_FIELDS] = {fetchBasic:fetchBasic,fetchEducation:fetchEducation, fetchEmployment:fetchEmployment, fetchProfilePicture:fetchProfilePicture, fetchSkill:fetchSkill};
        req.session[ApiConstants.USER_PROFILE_ID] = profileId;
        next();
    }
}
export = UserProfileApi