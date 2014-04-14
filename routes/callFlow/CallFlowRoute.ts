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
import PageData                                             = require('./PageData');
import Urls                                                 = require('./Urls');
import Middleware                                           = require('./Middleware');

class CallFlowRoute
{
    private static INDEX:string = 'callFlow/index';
    private static LOGIN:string = 'callFlow/login';
    private static PAYMENT:string = 'callFlow/payment';
    private static SCHEDULING:string = 'callFlow/scheduling';

    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private transactionDelegate = new TransactionDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();

    constructor(app)
    {
        // Actual rendered pages
        app.get(Urls.callExpert(), this.index.bind(this));
        app.post(Urls.callExpert(), this.scheduleSelected.bind(this));
        app.get(Urls.login(), this.authenticate.bind(this));
        app.get(Urls.callPayment(), Middleware.requireExpertAndAppointments, this.callPayment.bind(this));
        app.post(Urls.callPayment(), Middleware.requireExpertAndAppointments, this.checkout.bind(this));

        app.get(Urls.scheduling(), this.scheduling.bind(this));
        app.post(Urls.scheduling(), this.scheduling.bind(this));

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

        new IntegrationMemberDelegate().get(expertId, null, [IncludeFlag.INCLUDE_SCHEDULES, IncludeFlag.INCLUDE_USER])
            .then(
            function handleExpertFound(expert)
            {
                Middleware.setSelectedExpert(req, expert);
                var pageData = {
                    logged_in_user: req['user'],
                    user: expert.user[0],
                    expert: expert,
                    messages: req.flash(),
                    startTimes: Middleware.getAppointments(req),
                    duration: Middleware.getDuration(req)
                };

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
        // TODO: Validate duration
        var duration:number = req.body[ApiConstants.DURATION];
        Middleware.setDuration(req, duration);

        // TODO: Validate start times
        var startTimes:number[] = req.body[ApiConstants.START_TIME];
        Middleware.setAppointments(req, startTimes);

        if (req.isAuthenticated())
            res.redirect(Urls.callPayment());
        else
            res.redirect(Urls.login());
    }

    authenticate(req:express.Request, res:express.Response)
    {
        var expert = Middleware.getSelectedExpert(req);

        var pageData = {
            logged_in_user: req['user'],
            user: expert.getUser()[0],
            expert: expert,
            messages: req.flash()
        };

        res.render(CallFlowRoute.LOGIN, pageData);
    }

    /* Validate request from caller and start a new transaction */
    private callPayment(req, res:express.Response)
    {
        var expert = Middleware.getSelectedExpert(req);

        function renderPage(phoneNumbers:UserPhone[])
        {
            var pageData = {
                logged_in_user: req['user'],
                user: expert.getUser()[0],
                expert: expert,
                messages: req.flash(),
                startTimes: Middleware.getAppointments(req),
                duration: Middleware.getDuration(req),
                userPhones: phoneNumbers
            };

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

        var phoneCall = new PhoneCall();
        phoneCall.setIntegrationMemberId(Middleware.getSelectedExpert(req).getId());
        phoneCall.setExpertPhoneId(00);//TODO[alpha-calling] set expert phone Id correctly
        phoneCall.setCallerUserId(req[ApiConstants.USER].id);
        phoneCall.setCallerPhoneId(00);//TODO[alpha-calling] set caller phone Id correctly
        phoneCall.setDelay(0);
        phoneCall.setStatus(CallStatus.PLANNING);
        phoneCall.setDuration(Middleware.getDuration(req));

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
                if (!_.contains(appointment.startTimes, startTime))
                    throw 'Invalid request. Please click on one of the links in the email';
                else
                {
                    var callId:number = appointment.id;
                    self.phoneCallDelegate.get(callId, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_USER_PHONE, IncludeFlag.INCLUDE_EXPERT_PHONE]);
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
                    call: call
                };
                res.render(CallFlowRoute.SCHEDULING, pageData);
            });
    }

}

export = CallFlowRoute