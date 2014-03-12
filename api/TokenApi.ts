///<reference path='../_references.d.ts'/>
import express                                              = require('express');
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

            verificationCodeDelegate.createAndSendMobileVerificationCode(phoneNumber.getPhone(), phoneNumber.getCountryCode())
                .then(
                function codeCreated(code:string)
                {
                    // TODO: Tie this to flow somehow so that it doesn't get overwritten
                    // Save the phone number to which sms is sent and the generated code in session
                    // so we know which number to add to account when code is verified
                    req.session[ApiConstants.PHONE_NUMBER] = phoneNumber;
                    req.session[ApiConstants.CODE_VERIFICATION] = code;
                    res.send(200);
                },
                function codeCreationFailed() { res.send(500); }
            )
        });

        /* Verify mobile number code */
        app.get(ApiUrlDelegate.mobileVerificationCode(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var code:string = req.query[ApiConstants.CODE];
            var ref:string = req.session[ApiConstants.CODE_VERIFICATION];

            if (code === ref)
            {
                // Persist the phone number in session as verified and link to logged in user
                var phoneNumber:PhoneNumber = req.session[ApiConstants.PHONE_NUMBER];
                phoneNumber.setUserId(req['user'].id);
                phoneNumber.setVerified(true);
                phoneNumber.setType(PhoneNumberType.MOBILE);

                phoneNumberDelegate.create(phoneNumber)
                    .then(
                    function phoneNumberCreated(phoneNumber) { res.json(phoneNumber.toJson()); },
                    function phoneNumberCreateError(err) { res.send(500); }
                );
            }
            else
                res.send(401);
        });

        /* Create and send expert invitation code */
        app.put(ApiUrlDelegate.expertInvitationCode(), AccessControl.allowDashboard, function (req:express.Request, res:express.Response)
        {
            var sender:User = new User(req['user']);
            var member:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];
            member.setUser(new User(member.getUser()));

            verificationCodeDelegate.createAndSendExpertInvitationCode(member.getIntegrationId(), member, sender)
                .then(
                function codeCreatedAndSent() { res.json(200); },
                function codeCreateAndSendError(error) { res.send(500, error); }
            );
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