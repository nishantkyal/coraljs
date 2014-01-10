
var AccessControl = require('../middleware/AccessControl');
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');
var IntegrationMemberDelegate = require('../delegates/IntegrationMemberDelegate');
var IntegrationMember = require('../models/IntegrationMember');

/**
* API calls for managing settings to IntegrationMembers who are owners
* e.g. Viewing reports, manage payment details, manage admins
*/
var IntegrationOwnerApi = (function () {
    function IntegrationOwnerApi(app) {
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        /**
        * Add another member
        **/
        app.put(ApiUrlDelegate.integrationMember(), AccessControl.allowOwner, function (req, res) {
            var integrationId = req.params['integrationId'];
            var userId = req.query['userId'];
            var role = req.query['role'];

            integrationMemberDelegate.create({ 'user_id': userId, 'role': role, 'integration_id': integrationId }).then(function handleMemberAdded(result) {
                res.json(result);
            }, function handleMemberAddError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Get integration members
        * Allow owner and admin
        */
        app.get(ApiUrlDelegate.integrationMember(), AccessControl.allowAdmin, function (req, res) {
            var integrationId = req.params['integrationId'];

            integrationMemberDelegate.search({ 'integration_id': integrationId }).then(function handleMemberSearched(result) {
                res.json(result);
            }, function handleMemberSearchError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Remove a member
        * Allow owner and admin
        */
        app.delete(ApiUrlDelegate.integrationMemberById(), AccessControl.allowAdmin, function (req, res) {
            var integrationId = req.params['integrationId'];

            integrationMemberDelegate.delete(integrationId).then(function handleMemberSearched(result) {
                res.json(result);
            }, function handleMemberSearchError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Update settings for member
        * Allow owner or admin
        */
        app.post(ApiUrlDelegate.integrationMemberById(), AccessControl.allowAdmin, function (req, res) {
            var integrationId = req.params['integrationId'];
            var integrationMember = new IntegrationMember(req.body['integration_member']);

            integrationMemberDelegate.update({ 'integration_id': integrationId }, integrationMember).then(function handleMemberSearched(result) {
                res.json(result);
            }, function handleMemberSearchError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Get activity summary
        * Allow owner and admin
        **/
        app.get(ApiUrlDelegate.ownerActivitySummary(), function (req, res) {
        });
    }
    return IntegrationOwnerApi;
})();

module.exports = IntegrationOwnerApi;

