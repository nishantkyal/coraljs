///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import TemporaryTokenType                                   = require('../enums/TemporaryTokenType');
import ApiConstants                                         = require('../enums/ApiConstants');
import VerificationCodeCache                                = require('../caches/VerificationCodeCache');
import Utils                                                = require('../common/Utils');

class TokenApi
{
    constructor(app)
    {
        app.get(ApiUrlDelegate.tempToken(), function (req:express.Request, res:express.Response)
        {
            var tokenType:number = parseInt(TemporaryTokenType[req.query[ApiConstants.TYPE]]);

            switch (tokenType)
            {
                case TemporaryTokenType.EXPERT_INVITATION:

                    var integrationId:number = parseInt(req.query[ApiConstants.INTEGRATION_ID]);
                    var code:string = req.query[ApiConstants.CODE];
                    new VerificationCodeCache().searchInvitationCode(code, integrationId)
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

                    new VerificationCodeCache().searchMobileVerificationCode(code, ref)
                        .then(
                        function tokenFound() { res.send(200); },
                        function tokenSearchError() { res.send(500); }
                    );

                    break;

                case TemporaryTokenType.PASSWORD_RESET:

                    var userId:number = parseInt(req.query[ApiConstants.USER_ID]);
                    var ref:string = req.query[ApiConstants.CODE_VERIFICATION];

                    new VerificationCodeCache().searchPasswordResetCode(userId, ref)
                        .then(
                        function tokenFound() { res.send(200); },
                        function tokenSearchError() { res.send(500); }
                    );

                    break;
            }
        });

        app.put(ApiUrlDelegate.tempToken(), function (req:express.Request, res:express.Response)
        {

        });
    }
}
export = TokenApi