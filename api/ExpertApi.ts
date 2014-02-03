///<reference path='../_references.d.ts'/>
///<reference path='./ApiConstants.ts'/>
///<reference path='../middleware/AccessControl.ts'/>
///<reference path='../delegates/ApiUrlDelegate.ts'/>
///<reference path='../delegates/IntegrationDelegate.ts'/>
///<reference path='../delegates/IntegrationMemberDelegate.ts'/>
///<reference path='../delegates/UserDelegate.ts'/>
///<reference path='../models/IntegrationMember.ts'/>
///<reference path='../models/User.ts'/>
///<reference path='../enums/IntegrationMemberRole.ts'/>
///<reference path='../enums/ApiFlags.ts'/>

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
            app.get(delegates.ApiUrlDelegate.expert(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var searchCriteria:Object = req.body;

                integrationMemberDelegate.search(searchCriteria)
                    .then(
                    function handleExpertSearched(result) { res.json(result); },
                    function handleExpertSearchError(err) { res.status(500).json(err); }
                );
            });

            /** Get expert profile  **/
            app.get(delegates.ApiUrlDelegate.expertById(), function (req, res)
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
            app.put(delegates.ApiUrlDelegate.expert(), middleware.AccessControl.allowDashboard, function (req, res)
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
            app.delete(delegates.ApiUrlDelegate.expertById(), middleware.AccessControl.allowAdmin, function (req, res)
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
            app.post(delegates.ApiUrlDelegate.expertById(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var expertId = req.params[ApiConstants.EXPERT_ID];
                var integrationMember:models.IntegrationMember = req.body[ApiConstants.EXPERT];

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
            app.get(delegates.ApiUrlDelegate.expertActivitySummary(), middleware.AccessControl.allowExpert, function (req, res)
            {

            });

        }

    }}