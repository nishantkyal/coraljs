import q                                            = require('q');
import fs                                           = require('fs');
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
import Config                                       = require('../common/Config');
import IncludeFlag                                  = require('../enums/IncludeFlag');
import IntegrationMemberRole                        = require('../enums/IntegrationMemberRole');
import IntegrationStatus                            = require('../enums/IntegrationStatus');
import ImageSize                                    = require('../enums/ImageSize');

/*
 Rest Calls for Third party integrations
 */
class IntegrationApi
{
    private integrationDelegate = new IntegrationDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private notificationDelegate = new NotificationDelegate();

    constructor(app, secureApp)
    {
        var self = this;

        /* Create integration and send email to admin */
        app.put(ApiUrlDelegate.integration(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var integration:Integration = req.body[ApiConstants.INTEGRATION];
            var loggedInUser = new User(req[ApiConstants.USER]);

            if (!loggedInUser.getActive())
            {
                return self.verificationCodeDelegate.createPasswordResetCode(loggedInUser.getEmail())
                    .then(
                    function verificationCodeSent(code:string)
                    {
                        return res.send(401, 'Please activate your account by verifying email first.')
                    });
            }
            integration.setStatus(IntegrationStatus.ACTIVE);

            self.integrationDelegate.create(integration)
                .then(
                function integrationCreated()
                {
                    var integrationMember = new IntegrationMember();
                    integrationMember.setIntegrationId(integration.getId());
                    integrationMember.setRole(IntegrationMemberRole.Owner);
                    integrationMember.setUserId(loggedInUser.getId());

                    return [integration, q.all([
                        self.integrationMemberDelegate.create(integrationMember),
                        self.integrationDelegate.updateCache()
                    ])];
                })
                .spread(
                function memberCreated(integration:Integration, ...args)
                {
                    var member:IntegrationMember = args[0][0];
                    member.setUser(loggedInUser);
                    member.setIntegration(integration);

                    return [integration, self.notificationDelegate.sendIntegrationCreatedEmail(member)];
                })
                .spread(
                function resetPasswordEmailSent(integration)
                {
                    res.json(integration.toJson());
                })
                .fail(
                function (error)
                {
                    res.status(500).json(error);
                });
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
        app.post(ApiUrlDelegate.integrationById(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var integrationId = req.params[ApiConstants.INTEGRATION_ID];
            var integration:Integration = req.body[ApiConstants.INTEGRATION];

            self.integrationDelegate.update(Utils.createSimpleObject(Integration.COL_ID, integrationId),integration)
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

        app.get(ApiUrlDelegate.integrationLogo(), function (req:express.Request, res)
        {
            var integrationId:number = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
            var size:ImageSize = parseInt(req.query[ApiConstants.IMAGE_SIZE] || ImageSize.MEDIUM);
            var imagePath = Config.get(Config.LOGO_PATH) + integrationId + '_' + ImageSize[size].toLowerCase();

            if (fs.existsSync(imagePath))
                res.sendfile(imagePath);
            else
                res.sendfile('public/images/1x1.png');
        });

        app.post(ApiUrlDelegate.integrationLogo(), AuthenticationDelegate.checkLogin(), express.bodyParser({uploadDir: Config.get(Config.LOGO_PATH)}), function (req:express.Request, res:express.Response)
        {
            var uploadedFile = req.files['image'];
            var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);

            self.integrationDelegate.processLogoImage(integrationId, uploadedFile.path)
                .then(
                function uploadComplete()
                {
                    res.json({url: ApiUrlDelegate.integrationLogo(integrationId)});
                },
                function uploadError(error) { res.json(500, 'Error in uploading image'); }
            );
        });

    }
}
export = IntegrationApi