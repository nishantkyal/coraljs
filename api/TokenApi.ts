///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import log4js                                               = require('log4js');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import VerificationCodeDelegate                             = require('../delegates/VerificationCodeDelegate');
import EmailDelegate                                        = require('../delegates/EmailDelegate');
import PhoneNumberDelegate                                  = require('../delegates/PhoneNumberDelegate');
import TemporaryTokenType                                   = require('../enums/TemporaryTokenType');
import ApiConstants                                         = require('../enums/ApiConstants');
import PhoneNumberType                                      = require('../enums/PhoneNumberType');
import VerificationCodeCache                                = require('../caches/VerificationCodeCache');
import Utils                                                = require('../common/Utils');
import User                                                 = require('../models/User');
import IntegrationMember                                    = require('../models/IntegrationMember');
import PhoneNumber                                          = require('../models/PhoneNumber');

class TokenApi
{
    constructor(app)
    {
        var verificationCodeCache = new VerificationCodeCache();
        var verificationCodeDelegate = new VerificationCodeDelegate();
        var phoneNumberDelegate = new PhoneNumberDelegate();

        /* Create mobile verification code */
        app.put(ApiUrlDelegate.mobileVerificationCode(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var phoneNumber:PhoneNumber = req.body[ApiConstants.PHONE_NUMBER];
            phoneNumber.setUserId(req['user'].id);

            if (phoneNumber.isValid())
                res.send(JSON.stringify({status: 'ok'}));
            else
                res.send(400, 'Invalid phone number');

            verificationCodeDelegate.createAndSendMobileVerificationCode(phoneNumber);
        });

        /* Verify mobile number code */
        app.get(ApiUrlDelegate.mobileVerificationCode(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var code:string = req.query[ApiConstants.CODE];
            var phoneNumber:PhoneNumber = new PhoneNumber(req.query[ApiConstants.PHONE_NUMBER]);
            phoneNumber.setUserId(req['user'].id);

            verificationCodeDelegate.verifyMobileCode(code, phoneNumber)
                .then(
                    function codeVerified(newPhoneNumber) { res.send(newPhoneNumber.toJson()); },
                    function codeVerificationError(error) { res.send(500, error); }
                )
        });

        /* Create and send expert invitation code */
        app.put(ApiUrlDelegate.expertInvitationCode(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            res.send(JSON.stringify({status: 'OK'}));

            var sender:User = new User(req['user']);
            var member:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];
            member.setUser(new User(member.getUser()));
            verificationCodeDelegate.createAndSendExpertInvitationCode(member.getIntegrationId(), member, sender);
        });

        /* Verify expert invitation code */
        app.get(ApiUrlDelegate.expertInvitationCode(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
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
        });

    }
}
export = TokenApi