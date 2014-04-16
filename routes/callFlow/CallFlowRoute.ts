///<reference path='../../_references.d.ts'/>
import connect_ensure_login                                 = require('connect-ensure-login');
import q                                                    = require('q');
import _                                                    = require('underscore');
import moment                                               = require('moment');
import express                                              = require('express');
import passport                                             = require('passport');
import log4js                                               = require('log4js');
import RequestHandler                                       = require('../../middleware/RequestHandler');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import IntegrationDelegate                                  = require('../../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import PhoneCallDelegate                                    = require('../../delegates/PhoneCallDelegate');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import TransactionDelegate                                  = require('../../delegates/TransactionDelegate');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import UserPhoneDelegate                                    = require('../../delegates/UserPhoneDelegate');
import NotificationDelegate                                 = require('../../delegates/NotificationDelegate');
import Utils                                                = require('../../common/Utils');
import Config                                               = require('../../common/Config');
import PhoneCall                                            = require('../../models/PhoneCall');
import ExpertSchedule                                       = require('../../models/ExpertSchedule');
import Transaction                                          = require('../../models/Transaction');
import UserPhone                                            = require('../../models/UserPhone');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import TransactionStatus                                    = require('../../enums/TransactionStatus');
import Formatter                                            = require('../../common/Formatter');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');

import Urls                                                 = require('./Urls');
import Middleware                                           = require('./Middleware');
import SessionData                                          = require('./SessionData');

class CallFlowRoute
{
    private static INDEX:string = 'callFlow/index';
    private static LOGIN:string = 'callFlow/login';
    private static PAYMENT:string = 'callFlow/payment';
    private static SCHEDULING:string = 'callFlow/scheduling';

    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private transactionDelegate = new TransactionDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private notificationDelegate = new NotificationDelegate();

    constructor(app, secureApp)
    {
        // Actual rendered pages
        app.get(Urls.callExpert(), this.index.bind(this));
        app.post(Urls.callExpert(), this.scheduleSelected.bind(this));
        app.get(Urls.login(), this.authenticate.bind(this));
        app.get(Urls.callPayment(), Middleware.requireExpertAndAppointments, this.callPayment.bind(this));
        app.post(Urls.callPayment(), Middleware.requireExpertAndAppointments, this.checkout.bind(this));

        app.get(Urls.scheduling(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.login() }), this.scheduling.bind(this));
        app.post(Urls.scheduling(), this.scheduled.bind(this));

        app.get(Urls.reschedule(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.login() }), this.reschedule.bind(this));
        app.get(Urls.reject(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.login() }), this.reject.bind(this));

        // Auth related routes
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {successRedirect: Urls.callPayment(), failureRedirect: Urls.login(), failureFlash: true}));
        app.post(Urls.register(), AuthenticationDelegate.register({failureRedirect: Urls.login()}), this.callPayment.bind(this));
        app.get(Urls.fbLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, {scope: ['email']}));
        app.get(Urls.fbLoginCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, {failureRedirect: Urls.login(), scope: ['email'], successRedirect: Urls.callPayment()}));
    }

    /* Render index with expert schedules */
    private index(req:express.Request, res:express.Response)
    {
        var expertId = req.params[ApiConstants.EXPERT_ID];
        var sessionData = new SessionData(req);

        this.integrationMemberDelegate.get(expertId, null, [IncludeFlag.INCLUDE_SCHEDULES, IncludeFlag.INCLUDE_USER])
            .then(
            function handleExpertFound(expert)
            {
                sessionData.setExpert(expert);

                var pageData = _.extend(sessionData.getData(), {
                    messages: req.flash()
                });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(CallFlowRoute.INDEX, pageData);
            },
            function handleExpertSearchFailed(error) { res.status(401).json('Error getting expert details for id: ' + expertId)}
        );
    }

    // Redirect to login page if not logged in
    // Not using a middleware for this because login is not an absolute requirement to reach payment page
    scheduleSelected(req, res:express.Response)
    {
        var sessionData = new SessionData(req);

        // TODO: Validate duration
        var duration:number = req.body[ApiConstants.DURATION];
        sessionData.setDuration(duration);

        // TODO: Validate start times
        var startTimes:number[] = req.body[ApiConstants.START_TIME];
        sessionData.setAppointments(startTimes);

        if (req.isAuthenticated())
            res.redirect(Urls.callPayment());
        else
            res.redirect(Urls.login());
    }

    authenticate(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var pageData = _.extend(sessionData.getData(), {
            messages: req.flash()
        });

        res.render(CallFlowRoute.LOGIN, pageData);
    }

    /* Validate request from caller and start a new transaction */
    private callPayment(req, res:express.Response)
    {
        var sessionData = new SessionData(req);

        function renderPage(phoneNumbers:UserPhone[])
        {
            var pageData = _.extend(sessionData.getData(), {
                messages: req.flash(),
                userPhones: phoneNumbers
            });

            res.render(CallFlowRoute.PAYMENT, pageData);
        };

        // Require mobile number verification
        if (req.isAuthenticated())
        {
            var loggedInUserId = req['user'].id;
            var userPhoneSearch = {};
            userPhoneSearch[UserPhone.USER_ID] = loggedInUserId;
            userPhoneSearch[UserPhone.VERIFIED] = true;

            this.userPhoneDelegate.search(userPhoneSearch)
                .then(renderPage);
        }
        else
            renderPage(null);
    }

    /* Validate everything, create a transaction (and phone call record) and redirect to payment */
    private checkout(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);

        var phoneCall = new PhoneCall();
        phoneCall.setIntegrationMemberId(sessionData.getExpert().getId());
        phoneCall.setExpertPhoneId(00);//TODO[alpha-calling] set expert phone Id correctly
        phoneCall.setCallerUserId(req[ApiConstants.USER].id);
        phoneCall.setCallerPhoneId(00);//TODO[alpha-calling] set caller phone Id correctly
        phoneCall.setDelay(0);
        phoneCall.setStatus(CallStatus.PLANNING);
        phoneCall.setDuration(sessionData.getDuration());

        var transaction = new Transaction();
        transaction.setUserId(req[ApiConstants.USER].id);
        transaction.setStatus(TransactionStatus.PENDING);

        self.phoneCallDelegate.create(phoneCall)
            .then(
            function callCreated(call)
            {
                req.session['callId'] = call.getId();
               //TODO[alpha-calling] remove comment
               /* return self.transactionDelegate.createPhoneCallTransaction(transaction, call);
            })
            .then(
            function transactionCreated(transaction)
            {*/
                res.redirect(DashboardUrls.paymentCallback());
            })
            .fail (function(error){
                res.status(500);
            })
    }

    /* Invoked when expert/caller clicks on accept appointment link in email */
    private scheduling(req:express.Request, res:express.Response)
    {
        var self = this;
        var startTime:number = parseInt(req.query[ApiConstants.START_TIME]);
        var appointmentCode:string = req.query[ApiConstants.CODE];

        this.verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode)
            .then(
            function appointmentDetailsFetched(appointment)
            {
                if (!_.contains(appointment.startTimes, startTime.toString()))
                    throw 'Invalid request. Please click on one of the links in the email';
                else
                {
                    var callId:number = appointment.id;
                    return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_USER_PHONE, IncludeFlag.INCLUDE_EXPERT_PHONE]);
                }
            },
            function appointDetailsFetchFailed(error)
            {
                res.send(401, 'Invalid code');
            })
            .then(
            function callFetched(call)
            {
                var pageData = {
                    call: call,
                    startTime: startTime
                };
                res.render(CallFlowRoute.SCHEDULING, pageData);
            })
            .fail(function(error){
                res.status(501);
            })
    }

    private scheduled(req:express.Request, res:express.Response)
    {
        var self = this;
        var startTime:number = parseInt(req.body[ApiConstants.START_TIME]);
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        self.phoneCallDelegate.update(callId, {status: CallStatus.SCHEDULED, start_time: startTime})
            .then(
            function callUpdated()
            {
                return self.phoneCallDelegate.get(callId,null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function callFetched(call:PhoneCall)
            {
                self.notificationDelegate.sendCallSchedulingCompleteNotifications(call, startTime);
            })
            .fail(function(error){
                res.status(501);
            })
    }

    private reschedule(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        self.phoneCallDelegate.update(callId, {status: CallStatus.SCHEDULED})
            .then(
            function callUpdated()
            {
                return self.phoneCallDelegate.get(callId,null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function callFetched(call:PhoneCall)
            {

            })
            .fail(function(error){
                res.status(501);
            })
    }

    private reject(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        self.phoneCallDelegate.update(callId, {status: CallStatus.AGENDA_DECLINED})
            .then(
            function callUpdated()
            {
                return self.phoneCallDelegate.get(callId,null, [IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function callFetched(call:PhoneCall)
            {
                self.notificationDelegate.sendCallAgendaFailedNotifications(call);
            })
            .fail(function(error){
                res.status(501);
            })
    }

}

export = CallFlowRoute