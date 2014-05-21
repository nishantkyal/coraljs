///<reference path='../_references.d.ts'/>
import express                                      = require('express');
import connect_ensure_login                         = require('connect-ensure-login');
import ApiConstants                                 = require('../enums/ApiConstants');
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
    constructor(app, secureApp)
    {
        var integrationDelegate = new IntegrationDelegate();
        var integrationMemberDelegate = new IntegrationMemberDelegate();
        var notificaitonDelegate = new NotificationDelegate();
        var verificationCodeDelegate = new VerificationCodeDelegate();
        /*
         * Create integration
         * Allow only searchntalk.com admin
         */
        app.put(ApiUrlDelegate.integration(), function (req:express.Request, res:express.Response)
        {
            var integration = req.body[ApiConstants.INTEGRATION];
            var ownerEmail = req.body[ApiConstants.EMAIL];
            var sender = req.body[ApiConstants.USER];

            integrationDelegate.create(integration)
                .then(
                function integrationCreated()
                {
                    return integrationDelegate.updateCache();
                })
                .then (
                function cacheUpdated(){
                    var user = new User();
                    user.setEmail(ownerEmail);
                    var integrationMember = new IntegrationMember();
                    integrationMember.setRole(IntegrationMemberRole.Owner);
                    integrationMember.setUser(user);
                    integrationMember.setIntegrationId(integration.getId());

                    verificationCodeDelegate.createAndSendExpertInvitationCode(integration.getId(),integrationMember, sender);
                    //notificaitonDelegate.sendOwnerInvitationNotification(integration.getId(),ownerEmail);
                    res.json(integration.toJson());
                })
                .fail( function (error){  res.status(500).json(error);})
        });

        /* Delete integration */
        app.delete(ApiUrlDelegate.integrationById(), AccessControl.allowOwner, function (req:express.Request, res:express.Response)
        {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            integrationDelegate.delete(integrationId)
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
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var integration:Integration = req.body[ApiConstants.INTEGRATION];

            integrationDelegate.update(integration, {'integration_id': integrationId})
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
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            integrationDelegate.resetSecret(integrationId)
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
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var fields:string[] = req.query[ApiConstants.FIELDS];

            integrationDelegate.get(integrationId, fields)
                .then(
                function integrationFetched(integration:Integration) { res.json(integration); },
                function integrationFetchError(error) { res.status(500).json(error); }
            );
        });

        /* Search integrations */
        app.get(ApiUrlDelegate.integration(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var userId:number = parseInt(req.query[ApiConstants.USER_ID]);

            if (!Utils.isNullOrEmpty(userId))
                integrationMemberDelegate.search({user_id: userId}, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
                    .then(
                    function integrationFetched(result:Array<Integration>) { res.json(result); },
                    function integrationFetchError(error) { res.status(500).json(error); }
                );
            else
                res.json(integrationDelegate.getAll());
        });

    }
}
export = IntegrationApi