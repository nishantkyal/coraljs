///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import VerificationCodeDelegate                             = require('../delegates/VerificationCodeDelegate');
import EmailDelegate                                        = require('../delegates/EmailDelegate');
import TemporaryTokenType                                   = require('../enums/TemporaryTokenType');
import ApiConstants                                         = require('../enums/ApiConstants');
import VerificationCodeCache                                = require('../caches/VerificationCodeCache');
import Utils                                                = require('../common/Utils');
import User                                                 = require('../models/User');
import IntegrationMember                                    = require('../models/IntegrationMember');

class TokenApi
{
    constructor(app)
    {
        var verificationCodeCache = new VerificationCodeCache();
        var emailDelegate = new EmailDelegate();
        var verificationCodeDelegate = new VerificationCodeDelegate();

        app.get(ApiUrlDelegate.tempToken(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var tokenType:number = parseInt(TemporaryTokenType[req.query[ApiConstants.TYPE]]);

            switch (tokenType)
            {
                case TemporaryTokenType.EXPERT_INVITATION:

                    var integrationId:number = parseInt(req.query[ApiConstants.INTEGRATION_ID]);
                    var code:string = req.query[ApiConstants.CODE];
                    verificationCodeCache.searchInvitationCode(code, integrationId)
                        .then(
                        function tokenFound(user)
                        {
                            if (!Utils.isNullOrEmpty(user))
                                res.send(200);
                            else
                                res.send(401);
                        },
                        function tokenSearchError() { res.send(500); }
                    );

                    break;

                case TemporaryTokenType.MOBILE_VERIFICATION:

                    var code:string = req.query[ApiConstants.CODE];
                    var ref:string = req.query[ApiConstants.CODE_VERIFICATION];

                    verificationCodeCache.searchMobileVerificationCode(code, ref)
                        .then(
                        function tokenFound() { res.send(200); },
                        function tokenSearchError() { res.send(500); }
                    );

                    break;

                case TemporaryTokenType.PASSWORD_RESET:

                    var userId:number = parseInt(req.query[ApiConstants.USER_ID]);
                    var ref:string = req.query[ApiConstants.CODE_VERIFICATION];

                    verificationCodeCache.searchPasswordResetCode(userId, ref)
                        .then(
                        function tokenFound() { res.send(200); },
                        function tokenSearchError() { res.send(500); }
                    );

                    break;
            }
        });

        app.put(ApiUrlDelegate.tempToken(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var tokenType:number = parseInt(TemporaryTokenType[req.body[ApiConstants.TYPE]]);

            switch (tokenType)
            {
                case TemporaryTokenType.MOBILE_VERIFICATION:
                    verificationCodeCache.createMobileVerificationCode()
                        .then(
                        function codeCreated(result) { res.send(result); },
                        function codeCreationFailed(error) { res.send(500); }
                    )
                    break;
                case TemporaryTokenType.EXPERT_INVITATION:

                    var sender:User = new User(req['user']);
                    var member:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];
                    member.setUser(new User(member.getUser()));

                    verificationCodeDelegate.createAndSendExpertInvitationCode(member.getIntegrationId(), member, sender)
                        .then(
                        function codeCreatedAndSent() { res.json(200); },
                        function codeCreateAndSendError(error) { res.send(500, error); }
                    );

                    break;
                case TemporaryTokenType.PASSWORD_RESET:
                    var userId:number = req.body[ApiConstants.USER_ID];
                    verificationCodeCache.createPasswordResetCode(userId)
                        .then(
                        function codeCreated(result) { res.send(result); },
                        function codeCreationFailed() { res.send(500); }
                    )
                    break;
                case TemporaryTokenType.EMAIL_VERIFICATION:
                    var userId:number = req.body[ApiConstants.USER_ID];
                    verificationCodeCache.createPasswordResetCode(userId)
                        .then(
                        function passwordResetTokenGenerated(token) { res.json(token); },
                        function passwordResetTokenGenerateError(err) { res.status(500).json(err); }
                    );
                    break;
            }
        });
    }
}
export = TokenApi