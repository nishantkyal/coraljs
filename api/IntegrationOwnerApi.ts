///<reference path='../_references.d.ts'/>
import express                          = require('express');
import ApiConstants                     = require('../enums/ApiConstants');
import AccessControl                    = require('../middleware/AccessControl');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import IntegrationMemberDelegate        = require('../delegates/IntegrationMemberDelegate');
import IntegrationMember                = require('../models/IntegrationMember');

/*
 * API calls for managing settings to IntegrationMembers who are owners
 * e.g. Viewing reports, manage payment details, manage admins
 */
class IntegrationOwnerApi {

    constructor(app, secureApp)
    {
        var integrationMemberDelegate = new IntegrationMemberDelegate();

        /*
         * Add another member
         */
        app.put(ApiUrlDelegate.integrationMember(), AccessControl.allowOwner, function(req:express.Request, res:express.Response)
        {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var userId = req.query[ApiConstants.USER_ID];
            var role = req.query[ApiConstants.ROLE];

            integrationMemberDelegate.create({'user_id': userId, 'role': role, 'integration_id': integrationId})
                .then(
                function handleMemberAdded(result) { res.json(result); },
                function handleMemberAddError(err) { res.status(500).json(err); }
            );
        });

        /*
         * Get integration members
         * Allow owner and admin
         */
        app.get(ApiUrlDelegate.integrationMember(), AccessControl.allowAdmin, function(req:express.Request, res:express.Response)
        {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];

            integrationMemberDelegate.search({'integration_id': integrationId})
                .then(
                function handleMemberSearched(result) { res.json(result); },
                function handleMemberSearchError(err) { res.status(500).json(err); }
            );
        });

        /*
         * Update settings for member
         * Allow owner or admin
         */
        app.post(ApiUrlDelegate.integrationMemberById(), AccessControl.allowAdmin, function(req:express.Request, res:express.Response)
        {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var integrationMember:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];

            integrationMemberDelegate.update({'integration_id': integrationId}, integrationMember)
                .then(
                function handleMemberSearched(result) { res.json(result); },
                function handleMemberSearchError(err) { res.status(500).json(err); }
            );
        });

    }

}
export = IntegrationOwnerApi