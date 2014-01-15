import express                          = require('express');
import ApiConstants                     = require('./ApiConstants');
import AccessControl                    = require('../middleware/AccessControl');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import IntegrationMember                = require('../models/IntegrationMember');

/**
 * API calls for managing settings to IntegrationMembers who are owners
 * e.g. Viewing reports, manage payment details, manage admins
 */
class IntegrationOwnerApi {

    constructor(app)
    {
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        /**
         * Add another member
         **/
        app.put(ApiUrlDelegate.integrationMember(), AccessControl.allowOwner, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var userId = req.query['userId'];
            var role = req.query['role'];

            integrationMemberDelegate.create({'user_id': userId, 'role': role, 'integration_id': integrationId})
                .then(
                function handleMemberAdded(result) { res.json(result); },
                function handleMemberAddError(err) { res.status(500).json(err); }
            );
        });

        /**
         * Get integration members
         * Allow owner and admin
         */
        app.get(ApiUrlDelegate.integrationMember(), AccessControl.allowAdmin, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var integrationId = req.params['integrationId'];

            integrationMemberDelegate.search({'integration_id': integrationId})
                .then(
                function handleMemberSearched(result) { res.json(result); },
                function handleMemberSearchError(err) { res.status(500).json(err); }
            );
        });

        /**
         * Remove a member
         * Allow owner and admin
         */
        app.delete(ApiUrlDelegate.integrationMemberById(), AccessControl.allowAdmin, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var integrationId = req.params['integrationId'];

            integrationMemberDelegate.delete(integrationId)
                .then(
                function handleMemberSearched(result) { res.json(result); },
                function handleMemberSearchError(err) { res.status(500).json(err); }
            );
        });

        /**
         * Update settings for member
         * Allow owner or admin
         */
        app.post(ApiUrlDelegate.integrationMemberById(), AccessControl.allowAdmin, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var integrationId = req.params['integrationId'];
            var integrationMember = new IntegrationMember(req.body['integration_member']);

            integrationMemberDelegate.update({'integration_id': integrationId}, integrationMember)
                .then(
                function handleMemberSearched(result) { res.json(result); },
                function handleMemberSearchError(err) { res.status(500).json(err); }
            );
        });

        /**
         * Get activity summary
         * Allow owner and admin
         **/
        app.get(ApiUrlDelegate.ownerActivitySummary(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });
    }

}
export = IntegrationOwnerApi