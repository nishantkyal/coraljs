import q                                            = require('q');
import express                                      = require('express');
import ApiConstants                                 = require('../enums/ApiConstants');
import AuthenticationDelegate                       = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                               = require('../delegates/ApiUrlDelegate');
import IntegrationDelegate                          = require('../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                    = require('../delegates/IntegrationMemberDelegate');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');
import NotificationDelegate                         = require('../delegates/NotificationDelegate');
import VerificationCodeDelegate                     = require('../delegates/VerificationCodeDelegate');
import Integration                                  = require('../models/Integration');
import IntegrationMember                            = require('../models/IntegrationMember');
import User                                         = require('../models/User');
import AccessControl                                = require('../middleware/AccessControl');
import Utils                                        = require('../common/Utils');
import IncludeFlag                                  = require('../enums/IncludeFlag');
import IntegrationMemberRole                        = require('../enums/IntegrationMemberRole');

/*
 Rest Calls for Third party integrations
 */
class IntegrationApi
{
    private integrationDelegate = new IntegrationDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();

    constructor(app, secureApp)
    {
        var self = this;

        /*
         * Create integration
         * Allow only searchntalk.com admin
         */
        app.put(ApiUrlDelegate.integration(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var integration = req.body[ApiConstants.INTEGRATION];
            var loggedInUser = new User(req[ApiConstants.USER]);

            self.integrationDelegate.create(integration)
                .then(
                function integrationCreated()
                {
                    var integrationMember = new IntegrationMember();
                    integrationMember.setIntegrationId(integration.getId());
                    integrationMember.setRole(IntegrationMemberRole.Owner);
                    integrationMember.setUserId(loggedInUser.getId());

                    return [integration, q.all([
                        self.integrationDelegate.updateCache(),
                        self.integrationMemberDelegate.create(integrationMember)
                    ])];
                })
                .spread(
                function memberCreated(integration)
                {
                    res.json(integration.toJson());
                })
                .fail(function (error) { res.status(500).json(error);})
        });

        /* Delete integration */
        app.delete(ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req:express.Request, res:express.Response)
        {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];

            self.integrationDelegate.delete(integrationId)
                .then(
                function handleIntegrationDeleted(result) { res.json(result); },
                function handleIntegrationDeleteError(err) { res.status(500).json(err); }
            );
        });

        /*
         * Update integration settings
         */
        app.post(ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req:express.Request, res:express.Response)
        {
            var self = this;
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var integration:Integration = req.body[ApiConstants.INTEGRATION];

            self.integrationDelegate.update(integration, {'integration_id': integrationId})
                .then(
                function handleIntegrationUpdated(result) { res.json(result); },
                function handleIntegrationUpdateError(err) { res.status(500).json(err); }
            );
        });

        /*
         * Reset integration secret
         * Allow admin
         */
        app.post(ApiUrlDelegate.integrationSecretReset(), AccessControl.allowOwner, function (req:express.Request, res:express.Response)
        {
            var self = this;
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];

            self.integrationDelegate.resetSecret(integrationId)
                .then(
                function handleSecretReset(newSecret:string) { res.json(newSecret); },
                function handleSecretResetError(err) { res.status(500).json(err); }
            );
        });

        /*
         * Get integration details
         * Allow only admin and owner
         */
        app.get(ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req:express.Request, res:express.Response)
        {
            var self = this;
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var fields:string[] = req.query[ApiConstants.FIELDS];

            self.integrationDelegate.get(integrationId, fields)
                .then(
                function integrationFetched(integration:Integration) { res.json(integration); },
                function integrationFetchError(error) { res.status(500).json(error); }
            );
        });

        /* Search integrations */
        app.get(ApiUrlDelegate.integration(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var userId:number = parseInt(req.query[ApiConstants.USER_ID]);
            var self = this;

            if (!Utils.isNullOrEmpty(userId))
                self.integrationMemberDelegate.search({user_id: userId}, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
                    .then(
                    function integrationFetched(result:Array<Integration>) { res.json(result); },
                    function integrationFetchError(error) { res.status(500).json(error); }
                );
            else
                res.json(self.integrationDelegate.getAll());
        });

    }
}
export = IntegrationApi