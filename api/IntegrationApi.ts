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
import ImageDelegate                                = require('../delegates/ImageDelegate');
import Integration                                  = require('../models/Integration');
import IntegrationMember                            = require('../models/IntegrationMember');
import User                                         = require('../models/User');
import AccessControl                                = require('../middleware/AccessControl');
import Utils                                        = require('../common/Utils');
import Config                                       = require('../common/Config');
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
    private imageDelegate = new ImageDelegate();
    private notificationDelegate = new NotificationDelegate();

    constructor(app, secureApp)
    {
        var self = this;

        /* Create integration and send email to admin */
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
                        self.integrationMemberDelegate.create(integrationMember),
                        self.integrationDelegate.updateCache()
                    ])];
                })
                .spread(
                function memberCreated(integration:Integration, member:IntegrationMember)
                {
                    // Send member added email
                    // Send password reset code if new user
                    if (loggedInUser.getId() != member.getUser().getId())
                        return [
                            integration, 
                            self.verificationCodeDelegate.createPasswordResetCode(loggedInUser.getEmail())
                                .then(
                                function codeCreated(code:string)
                                {
                                    member.setIntegration(integration);
                                    return self.notificationDelegate.sendMemberAddedNotification(member, code)
                                })
                        ];   
                    else
                        return [integration, self.notificationDelegate.sendMemberAddedNotification(member)];
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
                })
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

        app.get(ApiUrlDelegate.integrationLogo(), function (req:express.Request, res)
        {
            var integrationId:number = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
            if (fs.existsSync(Config.get(Config.LOGO_PATH) + integrationId))
                res.sendfile(integrationId, {root: Config.get(Config.LOGO_PATH)});
            else
                res.redirect('/img/no_photo-icon.gif');
        });

        app.post(ApiUrlDelegate.integrationLogo(), AuthenticationDelegate.checkLogin(), express.bodyParser({uploadDir: Config.get(Config.LOGO_PATH)}), function (req:express.Request, res:express.Response)
        {
            var uploadedFile = req.files['image'];
            var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
            var newImagePath:string = Config.get(Config.LOGO_PATH) + integrationId;

            self.imageDelegate.move(uploadedFile.path, newImagePath)
                .then(
                function uploadComplete()
                {
                    res.json({url: ApiUrlDelegate.integrationLogo(integrationId)});
                },
                function uploadError(error) { res.send(500); }
            );
        });

    }
}
export = IntegrationApi