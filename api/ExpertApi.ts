import q                                                    = require('q');
import express                                              = require('express');
import _                                                    = require('underscore');
import ApiConstants                                         = require('../enums/ApiConstants');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import IntegrationDelegate                                  = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import NotificationDelegate                                 = require('../delegates/NotificationDelegate');
import UserDelegate                                         = require('../delegates/UserDelegate');
import IntegrationMember                                    = require('../models/IntegrationMember');
import User                                                 = require('../models/User');
import IntegrationMemberRole                                = require('../enums/IntegrationMemberRole');
import Utils                                                = require('../common/Utils');

/*
 * API calls for managing settings to IntegrationMembers who are experts
 * e.g. Call schedules, viewing reports, manage payment details
 */
class ExpertApi
{
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private integrationDelegate = new IntegrationDelegate();
    private userDelegate = new UserDelegate();
    private notificationDelegate = new NotificationDelegate();

    constructor(app, secureApp)
    {
        var self = this;

        /* Search expert */
        app.get(ApiUrlDelegate.expert(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var searchCriteria:Object = req.body;

            self.integrationMemberDelegate.search(searchCriteria, null)
                .then(
                function handleExpertSearched(result) { res.json(result); },
                function handleExpertSearchError(err) { res.status(500).json(err); }
            );
        });

        /* Get expert profile  */
        app.get(ApiUrlDelegate.expertById(), function (req:express.Request, res:express.Response)
        {
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);

            self.integrationMemberDelegate.get(expertId, null)
                .then(
                function handleExpertSearched(integrationMember) { res.json(integrationMember.toJson()); },
                function handleExpertSearchError(err) { res.status(500).json(err); }
            );
        });

        /* Convert user to expert for integrationId */
        app.put(ApiUrlDelegate.expert(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var user:User = req.body[ApiConstants.USER];
            user.setEmailVerified(true);
            user.setActive(true);

            var integrationMember:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];

            function createExpert():any
            {
                if (integrationMember.isValid())
                {
                    return self.integrationMemberDelegate.create(integrationMember)
                        .then(
                        function expertCreated(member:IntegrationMember)
                        {
                            member.setUser(user);
                            member.setIntegration(self.integrationDelegate.getSync(member.getIntegrationId()));
                            return [member, self.notificationDelegate.sendMemberAddedNotification(member)];
                        })
                        .spread(
                        function welcomeEmailSent(member:IntegrationMember)
                        {
                            res.json(member.toJson());
                        })
                        .fail(
                        function expertCreateFailed(error)
                        {
                            res.json(500, error);
                        });
                }
                else
                    res.json(401, 'Invalid input');

                return null;
            }

            if (!Utils.isNullOrEmpty(user) && user.isValid())
                self.userDelegate.create(user)
                    .then(
                    function userCreated(user:User)
                    {
                        integrationMember.setUserId(user.getId());
                        return createExpert();
                    })
                    .fail(
                    function expertCreateFailed(error)
                    {
                        res.json(500, error);
                    });
            else
                createExpert();
        });

        /* Remove expert status of user for integrationId */
        app.delete(ApiUrlDelegate.expertById(), AccessControl.allowAdmin, function (req:express.Request, res:express.Response)
        {
            var expertId = req.params[ApiConstants.EXPERT_ID];

            self.integrationMemberDelegate.delete(expertId)
                .then(
                function expertDeleted(result) { res.json(result); },
                function expertDeleteFailed(error) { res.status(500).json(error); }
            );
        });

        /*
         * Update expert's details (revenue share, enabled/disabled status)
         * Allow owner or admin
         */
        app.post(ApiUrlDelegate.expertById(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);
            var integrationMember:IntegrationMember = req.body[ApiConstants.EXPERT];

            self.integrationMemberDelegate.update(expertId, integrationMember)
                .then(
                function expertUpdated(result) { res.json(result); },
                function expertUpdateFailed(error) { res.status(500).json(error); }
            );

        });

        /*
         * Get activity summary for expert
         * Allow expert
         */
        app.get(ApiUrlDelegate.expertActivitySummary(), AccessControl.allowExpert, function (req:express.Request, res:express.Response)
        {

        });

    }

}
export = ExpertApi