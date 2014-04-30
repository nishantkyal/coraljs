///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserProfileDelegate                                  = require('../delegates/UserProfileDelegate');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiConstants                                         = require('../enums/ApiConstants');
import IntegrationMember                                    = require('../models/IntegrationMember');

class UserProfileApi
{
    constructor(app, secureApp)
    {
        var userProfileDelegate = new UserProfileDelegate();
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        app.get(ApiUrlDelegate.userProfileFromLinkedIn(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var profileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);
            var integrationMemberId:number = parseInt(req.query[ApiConstants.MEMBER_ID]);
            integrationMemberDelegate.get(integrationMemberId)
                .then( function(integrationMember:IntegrationMember){
                    userProfileDelegate.fetchProfilePictureFromLinkedIn(integrationMember.getUserId(), integrationMember.getIntegrationId(), profileId)
                        .then(
                        function profileFetched(profile) { res.json(profile); },
                        function profileFetchError(error) { res.status(500).send(error); }
                    );
                });
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