///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import log4js                                               = require('log4js');
import connect_ensure_login                                 = require('connect-ensure-login');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import VerificationCodeDelegate                             = require('../delegates/VerificationCodeDelegate');
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
    constructor(app, secureApp)
    {
        var verificationCodeDelegate = new VerificationCodeDelegate();
        var userDelegate = new UserDelegate();
        var userPhoneDelegate = new UserPhoneDelegate();

        /* Create mobile verification code */
        app.post(ApiUrlDelegate.mobileVerificationCode(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var phoneNumber:UserPhone = req.body[ApiConstants.PHONE_NUMBER];
            phoneNumber.setUserId(req['user'].id);

            verificationCodeDelegate.createAndSendMobileVerificationCode(phoneNumber)
                .then(
                function codeCreated() { res.json(200, {status: 'OK'}); },
                function codeCreateError(error) { res.send(500, error); }
            );
        });

        /* Verify mobile number code */
        app.get(ApiUrlDelegate.mobileVerificationCode(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var code:string = req.query[ApiConstants.CODE];
            var phoneNumber:UserPhone = new UserPhone(req.query[ApiConstants.PHONE_NUMBER]);

            verificationCodeDelegate.verifyMobileCode(code, phoneNumber)
                .then(
                function codeVerified(newUserPhone)
                {
                    if (Utils.isNullOrEmpty(phoneNumber.getId()))
                    {
                        phoneNumber.setUserId(req['user'].id);
                        return userPhoneDelegate.create(phoneNumber);
                    }
                    else
                        return userPhoneDelegate.update({id:phoneNumber.getId()},phoneNumber);
                })
                .then (
                function userPhoneUpdated(){
                    var returnTo:string = req.flash()[ApiConstants.RETURN_TO];
                    if (!Utils.isNullOrEmpty(returnTo))
                        res.redirect(returnTo);
                    else
                        res.send(phoneNumber.toJson());
                })
                .fail (
                function codeVerificationError(error)
                {
                    res.send(500, error);
                })
        });

        /* Create and send expert invitation code */
        app.post(ApiUrlDelegate.expertInvitationCode(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var sender:User = new User(req['user']);
            var member:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];
            member.setUser(new User(member.getUser()));

            verificationCodeDelegate.checkExistingAndSendEmailVerificationCode(member.getIntegrationId(), member, sender)
                .then(
                function codeSent() { res.send(JSON.stringify({status: 'OK'})); },
                function codeSendError(error) { res.json(500, error); }
            );
        });

        /* Create and send expert invitation code */
        app.post(ApiUrlDelegate.expertInvitationCodeResend(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var sender:User = new User(req['user']);
            var member:IntegrationMember = req.body[ApiConstants.INTEGRATION_MEMBER];
            member.setUser(new User(member.getUser()));

            verificationCodeDelegate.resendExpertInvitationCode(member.getIntegrationId(), member, sender)
                .then(
                function codeSent() { res.send(JSON.stringify({status: 'OK'})); },
                function codeSendError(error) { res.json(500, error); }
            );
        });

        /* Verify expert invitation code */
        app.get(ApiUrlDelegate.expertInvitationCode(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
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
            res.send(200);

            var email:string = req.body[ApiConstants.EMAIL];

            userDelegate.find({email: email})
                .then(
                function userFound(user:User)
                {
                    if (!Utils.isNullOrEmpty(user) && user.isValid())
                        verificationCodeDelegate.createAndSendPasswordResetCode(email)
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