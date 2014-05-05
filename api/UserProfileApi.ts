///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import passport                                             = require('passport');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserProfileDelegate                                  = require('../delegates/UserProfileDelegate');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiConstants                                         = require('../enums/ApiConstants');
import IntegrationMember                                    = require('../models/IntegrationMember');

class UserProfileApi
{
    constructor(app, secureApp)
    {
        var userProfileDelegate = new UserProfileDelegate();
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        app.get(ApiUrlDelegate.userProfileFromLinkedIn(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, {failureRedirect: '/',
            failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}), function(req:express.Request, res:express.Response)
        {
            var profileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);
            var integrationMemberId:number = parseInt(req.query[ApiConstants.MEMBER_ID]);
            var fetchProfile:boolean = req.query[ApiConstants.FETCH_PROFILE] == 'true' ? true :false;
            var fetchEducation:boolean = req.query[ApiConstants.FETCH_EDUCATION] == 'true' ? true :false;
            var fetchEmployment:boolean = req.query[ApiConstants.FETCH_EMPLOYMENT] == 'true' ? true :false;

            //TODO[ankit] - delete all previous entries - do it in transaction

            /*integrationMemberDelegate.get(integrationMemberId)
                .then( function(integrationMember:IntegrationMember){
                    if(fetchProfile)
                    {
                        userProfileDelegate.fetchProfilePictureFromLinkedIn(integrationMember.getUserId(), integrationMember.getIntegrationId(), profileId)
                    }
                })
                .fail(
                    function profileFetchError(error) { res.status(500).send(error); })*/
        });

        app.get(ApiUrlDelegate.userProfileFromLinkedInCallback(), function(req:express.Request, res:express.Response){
            res.send('OK');
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
}
export = UserProfileApi