
var _ = require('underscore');
var ApiConstants = require('./ApiConstants');
var AccessControl = require('../middleware/AccessControl');
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');
var IntegrationDelegate = require('../delegates/IntegrationDelegate');
var IntegrationMemberDelegate = require('../delegates/IntegrationMemberDelegate');
var IntegrationMember = require('../models/IntegrationMember');
var IntegrationMemberRole = require('../enums/IntegrationMemberRole');

/**
* API calls for managing settings to IntegrationMembers who are experts
* e.g. Call schedules, viewing reports, manage payment details
*/
var ExpertApi = (function () {
    function ExpertApi(app) {
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        /** Search expert **/
        app.get(ApiUrlDelegate.expert(), AccessControl.allowDashboard, function (req, res) {
            var searchCriteria = req.body;

            integrationMemberDelegate.search(searchCriteria).then(function handleExpertSearched(result) {
                res.json(result);
            }, function handleExpertSearchError(err) {
                res.status(500).json(err);
            });
        });

        /** Get expert profile  **/
        app.get(ApiUrlDelegate.expertById(), function (req, res) {
            var expertId = req.param[ApiConstants.EXPERT_ID];

            // TODO: Decide fields based on profile type requested
            var profileType = req.query[ApiConstants.PROFILE_TYPE];

            integrationMemberDelegate.get(expertId).then(function handleExpertSearched(integrationMember) {
                new IntegrationDelegate().get(integrationMember.integration_id).then(function handleIntegration(integration) {
                    res.json(_.extend(integrationMember, integration));
                });
            }, function handleExpertSearchError(err) {
                res.status(500).json(err);
            });
        });

        /** Convert user to expert for integrationId **/
        app.put(ApiUrlDelegate.expert(), AccessControl.allowDashboard, function (req, res) {
            var integrationMember = new IntegrationMember(req.body);
            integrationMember.setRole(IntegrationMemberRole.EXPERT);

            integrationMemberDelegate.create(integrationMember).then(function expertCreated(integrationMemberExpert) {
                res.json(integrationMemberExpert);
            }, function expertCreateFailed(error) {
                res.status(500).json(error);
            });
        });

        /** Remove expert status of user for integrationId **/
        app.delete(ApiUrlDelegate.expertById(), AccessControl.allowAdmin, function (req, res) {
            var expertId = req.params[ApiConstants.EXPERT_ID];

            integrationMemberDelegate.delete(expertId).then(function expertDeleted(result) {
                res.json(result);
            }, function expertDeleteFailed(error) {
                res.status(500).json(error);
            });
        });

        /**
        * Update expert's details (revenue share, enabled/disabled status)
        * Allow owner or admin
        **/
        app.post(ApiUrlDelegate.expertById(), AccessControl.allowDashboard, function (req, res) {
            var expertId = req.params[ApiConstants.EXPERT_ID];
            var integrationMember = req.body[ApiConstants.EXPERT];

            integrationMemberDelegate.updateById(expertId, integrationMember).then(function expertUpdated(result) {
                res.json(result);
            }, function expertUpdateFailed(error) {
                res.status(500).json(error);
            });
        });

        /**
        * Get activity summary for expert
        * Allow expert
        */
        app.get(ApiUrlDelegate.expertActivitySummary(), AccessControl.allowExpert, function (req, res) {
        });
    }
    return ExpertApi;
})();

module.exports = ExpertApi;

//# sourceMappingURL=ExpertApi.js.map
