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
import SessionStoreHelper                                   = require('../../helpers/SessionStorageHelper');
import Formatter                                            = require('../../common/Formatter');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');
import PageData                                             = require('./PageData');
import Urls                                                 = require('./Urls');
import Middleware                                           = require('./Middleware');

class CallFlowRoute
{
    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private transactionDelegate = new TransactionDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private emailDelegate = new EmailDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();

    constructor(app)
    {
        // Actual rendered pages
        app.get(Urls.callExpert(), this.index.bind(this));
        app.post(Urls.callExpert(), this.checkout.bind(this));
        app.get(Urls.paymentCallback(), Middleware.requireExpertAndAppointments.bind(this), this.paymentComplete.bind(this));

        app.get(Urls.scheduling(), this.scheduling.bind(this));
        app.post(Urls.scheduling(), this.scheduling.bind(this));

        // Auth related routes
        app.get(Urls.userFBLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, {scope: ['email']}));
        app.get(Urls.userFBLoginCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, {failureRedirect: DashboardUrls.login(), scope: ['email'], successRedirect: Urls.callExpert()}));
    }

    /* Render index with expert schedules */
    private index(req:express.Request, res:express.Response)
    {
        var expertId = req.params[ApiConstants.EXPERT_ID];
        req.session['returnTo'] = null;

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
                    startTimes: Middleware.getSelectedStartTimes(req),
                    duration: Middleware.getDuration(req)
                };

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render('callFlow/index', pageData);
            },
            function handleExpertSearchFailed(error) { res.status(401).json('Error getting expert details for id: ' + expertId)}
        );
    }

    /* Validate request from caller and start a new transaction */
    private checkout(req, res:express.Response)
    {
        // Create phone call in scheduled state with a transaction and redirect to gateway for payment
        var self = this;
        var loggedInUserId = req['user'].id;

        // TODO: Validate duration
        var duration:number = req.body[ApiConstants.DURATION];
        Middleware.setDuration(req, duration);

        // TODO: Validate start times
        var startTimes:number[] = req.body[ApiConstants.START_TIME];
        Middleware.setSelectedStartTimes(req, startTimes);

        // Require login
        if (!req.isAuthenticated())
        {
            req.session[ApiConstants.RETURN_TO] = req.url;
            res.redirect(DashboardUrls.login());
            return;
        }

        // Require mobile number verification
        var userPhoneSearch = {};
        userPhoneSearch[UserPhone.USER_ID] = loggedInUserId;
        userPhoneSearch[UserPhone.VERIFIED] = true;
        this.userPhoneDelegate.find(userPhoneSearch)
            .then(
            function userPhoneFound(userPhone:UserPhone)
            {
                if (userPhone)
                {
                    var call:PhoneCall = new PhoneCall();
                    call.setStatus(CallStatus.SCHEDULING);
                    call.setAgenda('');
                    call.setDuration(duration);
                    call.setCallerUserId(loggedInUserId);
                    call.setCallerPhoneId(userPhone.getId());

                    var transaction = new Transaction();
                    transaction.setStatus(TransactionStatus.PENDING);
                    transaction.setUserId(req['user'].id);
                    transaction.setTotalUnit(call.getPriceCurrency());

                    return self.transactionDelegate.createPhoneCallTransaction(transaction, call);
                }
                else
                {
                    req.session[ApiConstants.RETURN_TO] = req.url;
                    res.redirect(DashboardUrls.mobileVerification());
                    res.end();
                }
            })
            .then(
            function transactionCreated(t)
            {
                // Redirect to gateway
                res.redirect(Config.get('payment_gateway.url'));
            });

    }

    /* Handle payment response from gateway */
    private paymentComplete(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number;
        var startTimes:number[] = Middleware.getSelectedStartTimes(req);

        // TODO: Handle gateway response
        self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_USER_PHONE, IncludeFlag.INCLUDE_EXPERT_PHONE])
            .then(
            function callFetched(call:PhoneCall)
            {
                // Render payment complete page
                var pageData = {
                    call: call
                };
                res.render('callFlow/paymentComplete', pageData);

                return q.all([
                    self.emailDelegate.sendSchedulingEmailToExpert(Middleware.getSelectedExpert(req), startTimes, Middleware.getDuration(req), req['user'], call),
                    self.emailDelegate.sendPaymentCompleteEmail()
                ]);
            },
            function callFetchError(error)
            {
                res.send(500);
            });
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
                res.render('callFlow/scheduling', pageData);
            });
    }

}

export = CallFlowRoute