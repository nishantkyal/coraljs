///<reference path='../_references.d.ts'/>
import q                                = require('q');
import express                          = require('express');
import _                                = require('underscore');
import ApiConstants                     = require('../enums/ApiConstants');
import AccessControl                    = require('../middleware/AccessControl');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import IntegrationDelegate              = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import UserDelegate                     = require('../delegates/UserDelegate');
import IntegrationMember                = require('../models/IntegrationMember');
import User                             = require('../models/User');
import IntegrationMemberRole            = require('../enums/IntegrationMemberRole');
import ApiFlags                         = require('../enums/ApiFlags');

/**
 * API calls for managing settings to IntegrationMembers who are experts
 * e.g. Call schedules, viewing reports, manage payment details
 */
class ExpertApi
{
    constructor(app)
    {
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        /** Search expert **/
        app.get(ApiUrlDelegate.expert(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var searchCriteria:Object = req.body;

            integrationMemberDelegate.search(searchCriteria)
                .then(
                function handleExpertSearched(result) { res.json(result); },
                function handleExpertSearchError(err) { res.status(500).json(err); }
            );
        });

        /** Get expert profile  **/
        app.get(ApiUrlDelegate.expertById(), function (req:express.Request, res:express.Response)
        {
            var expertId = req.params[ApiConstants.EXPERT_ID];
            var includes:string[] = [].concat(req.query[ApiConstants.INCLUDE]);

            integrationMemberDelegate.get(expertId, null, includes)
                .then(
                function handleExpertSearched(integrationMember) { res.json(integrationMember); },
                function handleExpertSearchError(err) { res.status(500).json(err); }
            );
        });

        /** Convert user to expert for integrationId **/
        app.put(ApiUrlDelegate.expert(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var integrationMember:IntegrationMember = new IntegrationMember(req.body);
            integrationMember.setRole(IntegrationMemberRole.EXPERT);

            if (integrationMember.getUserId() != null)
                integrationMemberDelegate.create(integrationMember)
                    .then(
                    function expertCreated(integrationMemberExpert:IntegrationMember) { res.json(integrationMemberExpert); },
                    function expertCreateFailed(error) { res.status(500).json(error); }
                )
            else
                res.status(401).json('User needs to be registered before becoming an expert');
        });

        /** Remove expert status of user for integrationId **/
        app.delete(ApiUrlDelegate.expertById(), AccessControl.allowAdmin, function (req:express.Request, res:express.Response)
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
        app.post(ApiUrlDelegate.expertById(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
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
        app.get(ApiUrlDelegate.expertActivitySummary(), AccessControl.allowExpert, function (req:express.Request, res:express.Response)
        {

        });

    }

}
export = ExpertApi