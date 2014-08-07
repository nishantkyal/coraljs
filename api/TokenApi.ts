import express                                              = require('express');
import log4js                                               = require('log4js');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import VerificationCodeDelegate                             = require('../delegates/VerificationCodeDelegate');
import NotificationDelegate                                 = require('../delegates/NotificationDelegate');
import EmailDelegate                                        = require('../delegates/EmailDelegate');
import UserDelegate                                         = require('../delegates/UserDelegate');
import UserPhoneDelegate                                    = require('../delegates/UserPhoneDelegate');
import TemporaryTokenType                                   = require('../enums/TemporaryTokenType');
import ApiConstants                                         = require('../enums/ApiConstants');
import PhoneType                                            = require('../enums/PhoneType');
import Utils                                                = require('../common/Utils');
import User                                                 = require('../models/User');
import IntegrationMember                                    = require('../models/IntegrationMember');
import UserPhone                                            = require('../models/UserPhone');

class TokenApi
{
    constructor(app)
    {
        var verificationCodeDelegate = new VerificationCodeDelegate();
        var userDelegate = new UserDelegate();
        var userPhoneDelegate = new UserPhoneDelegate();
        var notificationDelegate = new NotificationDelegate();

        /* Create mobile verification code */
        app.post(ApiUrlDelegate.mobileVerificationCode(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var phoneNumber:UserPhone = req.body[ApiConstants.PHONE_NUMBER];
            phoneNumber.setUserId(req['user'].id);

            verificationCodeDelegate.createAndSendMobileVerificationCode(phoneNumber)
                .then(
                function codeCreated() { res.json(200, {status: 'OK'}); },
                function codeCreateError(error) { res.send(500, error); }
            );
        });

        // Resend Mobile Verification Code
        app.post(ApiUrlDelegate.resendMobileVerificationCode(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var phoneNumber:UserPhone = new UserPhone(req.body[ApiConstants.PHONE_NUMBER]);
            phoneNumber.setUserId(req['user'].id);
            verificationCodeDelegate.resendMobileVerificationCode(phoneNumber)
                .then(
                function codeResend() { res.json(200, {status: 'OK'}); },
                function codeResendError(error) { res.send(500, error); }
                )
        });

        /* Verify mobile number code */
        app.get(ApiUrlDelegate.mobileVerificationCode(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var code:string = req.query[ApiConstants.CODE];
            var phoneNumber:UserPhone = new UserPhone(req.query[ApiConstants.PHONE_NUMBER]);

            verificationCodeDelegate.verifyMobileCode(code, phoneNumber)
                .then(
                function codeVerified()
                {
                    phoneNumber.setUserId(req['user'].id);
                    return userPhoneDelegate.create(phoneNumber);
                })
                .then(
                function userPhoneCreated(createdPhone:UserPhone)
                {
                    res.send(createdPhone.toJson());
                })
                .fail(
                function codeVerificationError(error:Error)
                {
                    res.json(500, error.message);
                });
        });


        /* Create and send expert invitation code */
        app.post(ApiUrlDelegate.expertInvitationCode(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var sender:User = new User(req['user']);
            var member:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];
            var invitedUser:User = req.body[ApiConstants.USER];

            verificationCodeDelegate.checkExistingAndSendEmailVerificationCode(member.getIntegrationId(), member, invitedUser, sender)
                .then(
                function codeSent() { res.send(JSON.stringify({status: 'OK'})); },
                function codeSendError(error) { res.json(500, error); }
            );
        });

        /* Create and send expert invitation code */
        app.post(ApiUrlDelegate.expertInvitationCodeResend(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var sender:User = new User(req[ApiConstants.USER]);
            var invitedUserEmail:string = req.body[ApiConstants.EMAIL];
            var integrationId:number = parseInt(req.body[ApiConstants.INTEGRATION_ID]);

            verificationCodeDelegate.resendExpertInvitationCode(integrationId, invitedUserEmail, sender)
                .then(
                function codeSent() { res.send(JSON.stringify({status: 'OK'})); },
                function codeSendError(error) { res.json(500, error); }
            );
        });

        /* Verify expert invitation code */
        app.get(ApiUrlDelegate.expertInvitationCode(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var integrationId:number = parseInt(req.query[ApiConstants.INTEGRATION_ID]);
            var code:string = req.query[ApiConstants.CODE];

            verificationCodeDelegate.searchInvitationCode(code, integrationId)
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

        /* Create and send password reset code */
        app.post(ApiUrlDelegate.sendForgotPasswordCode(), function (req:express.Request, res:express.Response)
        {
            var email:string = req.body[ApiConstants.EMAIL];

            userDelegate.find({email: email})
                .then(
                function userFound(user:User)
                {
                    if (!Utils.isNullOrEmpty(user) && user.isValid())
                        return verificationCodeDelegate.createPasswordResetCode(email);
                    else
                        throw new Error("No such user exists");
                })
                .then(
                function codeCreated(code:string)
                {
                    return notificationDelegate.sendPasswordResetNotification(email, code);
                })
                .then(
                function codeSent()
                {
                    res.send(200);
                })
                .fail(
                function handleError(error:Error)
                {
                    res.json(400, error.message);
                });
        });

        /* Use code to update password*/
        app.post(ApiUrlDelegate.resetPassword(), function (req:express.Request, res:express.Response)
        {
            var code:string = req.body[ApiConstants.CODE];
            var password:string = req.body[ApiConstants.PASSWORD];

            verificationCodeDelegate.verifyCodeAndResetPassword(code, password)
                .then(
                function passwordUpdated() { res.send(200); },
                function passwordUpdateError(error) { res.send(500); }
            )
        });

    }
}
export = TokenApi