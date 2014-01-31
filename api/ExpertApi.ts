///<reference path='./ApiConstants'/>
///<reference path='../middleware/AccessControl'/>
///<reference path='../delegates/ApiUrlDelegate'/>
///<reference path='../delegates/IntegrationDelegate'/>
///<reference path='../delegates/IntegrationMemberDelegate'/>
///<reference path='../delegates/UserDelegate'/>
///<reference path='../models/IntegrationMember'/>
///<reference path='../models/User'/>
///<reference path='../enums/IntegrationMemberRole'/>
///<reference path='../enums/ApiFlags'/>
import express              = require('express');

/**
 * API calls for managing settings to IntegrationMembers who are experts
 * e.g. Call schedules, viewing reports, manage payment details
 */
module api
{
    export class ExpertApi
    {
        constructor(app)
        {
            var integrationMemberDelegate = new delegates.IntegrationMemberDelegate();

            /** Search expert **/
            app.get(delegates.ApiUrlDelegate.expert(), middleware.AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var searchCriteria:Object = req.body;

                integrationMemberDelegate.search(searchCriteria)
                    .then(
                    function handleExpertSearched(result) { res.json(result); },
                    function handleExpertSearchError(err) { res.status(500).json(err); }
                );
            });

            /** Get expert profile  **/
            app.get(delegates.ApiUrlDelegate.expertById(), function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var expertId = req.params[api.ApiConstants.EXPERT_ID];
                var includes:string[] = [].concat(req.query[api.ApiConstants.INCLUDE]);

                integrationMemberDelegate.get(expertId, null, includes)
                    .then(
                    function handleExpertSearched(integrationMember) { res.json(integrationMember); },
                    function handleExpertSearchError(err) { res.status(500).json(err); }
                );
            });

            /** Convert user to expert for integrationId **/
            app.put(delegates.ApiUrlDelegate.expert(), middleware.AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var integrationMember:models.IntegrationMember = new models.IntegrationMember(req.body);
                integrationMember.setRole(enums.IntegrationMemberRole.EXPERT);

                if (integrationMember.getUserId() != null)
                    integrationMemberDelegate.create(integrationMember)
                        .then(
                        function expertCreated(integrationMemberExpert:models.IntegrationMember) { res.json(integrationMemberExpert); },
                        function expertCreateFailed(error) { res.status(500).json(error); }
                    )
                else
                    res.status(401).json('User needs to be registered before becoming an expert');
            });

            /** Remove expert status of user for integrationId **/
            app.delete(delegates.ApiUrlDelegate.expertById(), middleware.AccessControl.allowAdmin, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var expertId = req.params[api.ApiConstants.EXPERT_ID];

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
            app.post(delegates.ApiUrlDelegate.expertById(), middleware.AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var expertId = req.params[api.ApiConstants.EXPERT_ID];
                var integrationMember:models.IntegrationMember = req.body[api.ApiConstants.EXPERT];

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
            app.get(delegates.ApiUrlDelegate.expertActivitySummary(), middleware.AccessControl.allowExpert, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {

            });

        }

    }}