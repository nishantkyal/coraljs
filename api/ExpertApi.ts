import express                          = require('express');
import _                                = require('underscore');
import ApiConstants                     = require('./ApiConstants');
import AccessControl                    = require('../middleware/AccessControl');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import IntegrationDelegate              = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import IntegrationMember                = require('../models/IntegrationMember');
import IntegrationMemberRole            = require('../enums/IntegrationMemberRole');

/**
 * API calls for managing settings to IntegrationMembers who are experts
 * e.g. Call schedules, viewing reports, manage payment details
 */
class ExpertApi {

    constructor(app)
    {
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        /** Search expert **/
        app.get(ApiUrlDelegate.expert(), AccessControl.allowDashboard, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var searchCriteria:Object = req.body;

            integrationMemberDelegate.search(searchCriteria)
                .then(
                function handleExpertSearched(result) { res.json(result); },
                function handleExpertSearchError(err) { res.status(500).json(err); }
            );
        });

        /** Get expert profile  **/
        app.get(ApiUrlDelegate.expertById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var expertId = req.param[ApiConstants.EXPERT_ID];

            // TODO: Decide fields based on profile type requested
            var profileType = req.query[ApiConstants.PROFILE_TYPE];

            integrationMemberDelegate.get(expertId)
                .then(
                function handleExpertSearched(integrationMember)
                {
                    new IntegrationDelegate().get(integrationMember.integration_id)
                        .then(
                        function handleIntegration(integration)
                        {
                            res.json(_.extend(integrationMember, integration));
                        }
                    )
                },
                function handleExpertSearchError(err) { res.status(500).json(err); }
            );
        });

        /** Convert user to expert for integrationId **/
        app.put(ApiUrlDelegate.expert(), AccessControl.allowDashboard, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var integrationMember:IntegrationMember = new IntegrationMember(req.body);
            integrationMember.setRole(IntegrationMemberRole.EXPERT);

            integrationMemberDelegate.create(integrationMember)
                .then(
                function expertCreated(integrationMemberExpert:IntegrationMember) { res.json(integrationMemberExpert); },
                function expertCreateFailed(error) { res.status(500).json(error); }
            )
        });

        /** Remove expert status of user for integrationId **/
        app.delete(ApiUrlDelegate.expertById(), AccessControl.allowAdmin, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var expertId = req.params[ApiConstants.EXPERT_ID];

            integrationMemberDelegate.delete(expertId)
                .then(
                function expertDeleted(result) { res.json(result); },
                function expertDeleteFailed(error) { res.status(500).json(error); }
            );
        });

        /**
         * Update expert's details (revenue share, enabled/disabled status)
         * Allow owner or admin
         **/
        app.post(ApiUrlDelegate.expertById(), AccessControl.allowDashboard, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var expertId = req.params[ApiConstants.EXPERT_ID];
            var integrationMember:IntegrationMember = req.body[ApiConstants.EXPERT];

            integrationMemberDelegate.updateById(expertId, integrationMember)
                .then(
                function expertUpdated(result) { res.json(result); },
                function expertUpdateFailed(error) { res.status(500).json(error); }
            );

        });

        /**
         * Get activity summary for expert
         * Allow expert
         */
        app.get(ApiUrlDelegate.expertActivitySummary(), AccessControl.allowExpert, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

    }

}
export = ExpertApi