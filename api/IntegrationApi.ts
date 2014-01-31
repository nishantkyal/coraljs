///<reference path='./ApiConstants'/>;
///<reference path='../delegates/ApiUrlDelegate'/>;
///<reference path='../delegates/IntegrationDelegate'/>;
///<reference path='../models/Integration'/>;
///<reference path='../middleware/AccessControl'/>;

/**
 Rest Calls for Third party integrations
 **/
module api
{
    export class IntegrationApi
    {
        constructor(app)
        {
            var integrationDelegate = new IntegrationDelegate();

            /**
             * Create integration
             * Allow only searchntalk.com admin
             **/
            app.put(delegates.ApiUrlDelegate.integration(), AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var integration = req.params[ApiConstants.INTEGRATION];

                integrationDelegate.create(integration)
                    .then(
                    function handleIntegrationCreated(result) { res.json(result); },
                    function handleIntegrationCreateError(err) { res.status(500).json(err); }
                );
            });

            /** Delete integration **/
            app.delete(delegates.ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var integrationId = req.params[ApiConstants.INTEGRATION_ID];
                integrationDelegate.delete(integrationId)
                    .then(
                    function handleIntegrationDeleted(result) { res.json(result); },
                    function handleIntegrationDeleteError(err) { res.status(500).json(err); }
                );
            });

            /**
             * Update integration settings
             **/
            app.post(delegates.ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var integrationId = req.params[ApiConstants.INTEGRATION_ID];
                var integration:Integration = req.body[ApiConstants.INTEGRATION];

                integrationDelegate.update(integration, {'integration_id': integrationId})
                    .then(
                    function handleIntegrationUpdated(result) { res.json(result); },
                    function handleIntegrationUpdateError(err) { res.status(500).json(err); }
                );
            });

            /**
             * Reset integration secret
             * Allow admin
             **/
            app.post(delegates.ApiUrlDelegate.integrationSecretReset(), AccessControl.allowOwner, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var integrationId = req.params[ApiConstants.INTEGRATION_ID];
                integrationDelegate.resetSecret(integrationId)
                    .then(
                    function handleSecretReset(newSecret:string) { res.json(newSecret); },
                    function handleSecretResetError(err) { res.status(500).json(err); }
                );
            });

            /**
             * Get integration details
             * Allow only admin and owner
             **/
            app.get(delegates.ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                var integrationId = req.params[ApiConstants.INTEGRATION_ID];
                var fields:string[] = req.query[ApiConstants.FIELDS];

                integrationDelegate.get(integrationId, fields)
                    .then(
                    function integrationFetched(integration:Integration) { res.json(integration); },
                    function integrationFetchError(error) { res.status(500).json(error); }
                );
            });

            /**
             * Search integrations
             * Allow only site admin and CSR
             **/
            app.get(delegates.ApiUrlDelegate.integration(), AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {
                integrationDelegate.getAll()
                    .then(
                    function integrationFetched(result:Array) { res.json(result); },
                    function integrationFetchError(error) { res.status(500).json(error); }
                );
            });

        }
    }
}