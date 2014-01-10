
var ApiConstants = require('./ApiConstants');
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');
var IntegrationDelegate = require('../delegates/IntegrationDelegate');
var Integration = require('../models/Integration');
var AccessControl = require('../middleware/AccessControl');

/**
Rest Calls for Third party integrations
**/
var IntegrationApi = (function () {
    function IntegrationApi(app) {
        var integrationDelegate = new IntegrationDelegate();

        /**
        * Create integration
        * Allow only searchntalk.com admin
        **/
        app.put(ApiUrlDelegate.integration(), AccessControl.allowDashboard, function (req, res) {
            var integration = req.params[ApiConstants.INTEGRATION];

            integrationDelegate.create(integration).then(function handleIntegrationCreated(result) {
                res.json(result);
            }, function handleIntegrationCreateError(err) {
                res.status(500).json(err);
            });
        });

        /** Delete integration **/
        app.delete(ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req, res) {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            integrationDelegate.delete(integrationId).then(function handleIntegrationDeleted(result) {
                res.json(result);
            }, function handleIntegrationDeleteError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Update integration settings
        **/
        app.post(ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req, res) {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var integration = req.body[ApiConstants.INTEGRATION];

            integrationDelegate.update(integration, { 'integration_id': integrationId }).then(function handleIntegrationUpdated(result) {
                res.json(result);
            }, function handleIntegrationUpdateError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Reset integration secret
        * Allow admin
        **/
        app.post(ApiUrlDelegate.integrationSecretReset(), AccessControl.allowOwner, function (req, res) {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            integrationDelegate.resetSecret(integrationId).then(function handleSecretReset(newSecret) {
                res.json(newSecret);
            }, function handleSecretResetError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Get integration details
        * Allow only admin and owner
        **/
        app.get(ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req, res) {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var fields = req.query[ApiConstants.FIELDS];

            integrationDelegate.get(integrationId, fields).then(function integrationFetched(integration) {
                res.json(integration);
            }, function integrationFetchError(error) {
                res.status(500).json(error);
            });
        });

        /**
        * Search integrations
        * Allow only site admin and CSR
        **/
        app.get(ApiUrlDelegate.integration(), AccessControl.allowDashboard, function (req, res) {
            integrationDelegate.getAll().then(function integrationFetched(result) {
                res.json(result);
            }, function integrationFetchError(error) {
                res.status(500).json(error);
            });
        });
    }
    return IntegrationApi;
})();

module.exports = IntegrationApi;

