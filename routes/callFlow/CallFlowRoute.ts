///<reference path='../../_references.d.ts'/>
import connect_ensure_login                                 = require('connect-ensure-login');
import q                                                    = require('q');
import _                                                    = require('underscore');
import moment                                               = require('moment');
import express                                              = require('express');
import passport                                             = require('passport');
import log4js                                               = require('log4js');
import RequestHandler                                       = require('../../middleware/RequestHandler');
import MysqlDelegate                                        = require('../../delegates/MysqlDelegate');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import IntegrationDelegate                                  = require('../../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import PhoneCallDelegate                                    = require('../../delegates/PhoneCallDelegate');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import TransactionDelegate                                  = require('../../delegates/TransactionDelegate');
import TransactionLineDelegate                              = require('../../delegates/TransactionLineDelegate');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import UserPhoneDelegate                                    = require('../../delegates/UserPhoneDelegate');
import NotificationDelegate                                 = require('../../delegates/NotificationDelegate');
import PhoneCall                                            = require('../../models/PhoneCall');
import ExpertSchedule                                       = require('../../models/ExpertSchedule');
import Transaction                                          = require('../../models/Transaction');
import Coupon                                               = require('../../models/Coupon');
import UserPhone                                            = require('../../models/UserPhone');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import TransactionLine                                      = require('../../models/TransactionLine');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import MoneyUnit                                            = require('../../enums/MoneyUnit');
import TransactionStatus                                    = require('../../enums/TransactionStatus');
import Formatter                                            = require('../../common/Formatter');
import Utils                                                = require('../../common/Utils');
import Config                                               = require('../../common/Config');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');
import PayZippyProvider                                     = require('../../providers/PayZippyProvider');

import Urls                                                 = require('./Urls');
import Middleware                                           = require('./Middleware');
import SessionData                                          = require('./SessionData');

class CallFlowRoute
{
    private static INDEX:string = 'callFlow/index';
    private static PAYMENT:string = 'callFlow/payment';

    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private transactionDelegate = new TransactionDelegate();
    private transactionLineDelegate = new TransactionLineDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();

    constructor(app, secureApp)
    {
        // Actual rendered pages
        app.get(Urls.callExpert(), this.index.bind(this));
        app.get(Urls.callPayment(), Middleware.requireCallerAndCallDetails, this.callPaymentPage.bind(this));
        app.post(Urls.callPayment(), Middleware.requireCallerAndCallDetails, this.callPayment.bind(this));
        app.post(Urls.applyCoupon(), Middleware.requireTransaction, this.applyCoupon.bind(this))
        app.post(Urls.checkout(), connect_ensure_login.ensureLoggedIn(), Middleware.requireTransaction, this.checkout.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN), this.handleLoginJustBeforeCheckout.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register, this.handleLoginJustBeforeCheckout.bind(this));
    }

    /* Render index with expert schedules */
    private index(req:express.Request, res:express.Response)
    {
        var expertId = req.params[ApiConstants.EXPERT_ID];
        var sessionData = new SessionData(req);

        this.integrationMemberDelegate.get(expertId, IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_SCHEDULES, IncludeFlag.INCLUDE_USER])
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

    /* Redirect to convert post to get
     * Note: We're doing a POST so that user selected params don't appear in url*/
    private callPayment(req, res:express.Response)
    {
        res.redirect(Urls.callPayment());
    }

    /* Validate request from caller and start a new transaction */
    private callPaymentPage(req, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var self = this;
        var expert = sessionData.getExpert();
        var loggedInUserId = req.isAuthenticated() ? sessionData.getLoggedInUser().getId() : null;
        var tasks = [];

        // Create transaction if doesn't exist and send back transaction lines
        if (sessionData.getTransaction())
            tasks.push(self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, sessionData.getTransaction().getId())));
        else
        {
            var phoneCall = new PhoneCall();
            phoneCall.setIntegrationMemberId(sessionData.getExpert().getId());
            phoneCall.setDelay(0);
            phoneCall.setStatus(CallStatus.PLANNING);
            phoneCall.setDuration(sessionData.getDuration());
            phoneCall.setPricePerMin(expert.getSchedule()[0][ExpertSchedule.PRICE_PER_MIN]);
            phoneCall.setPriceCurrency(expert.getSchedule()[0][ExpertSchedule.PRICE_UNIT]);
            phoneCall.setCallerUserId(loggedInUserId);

            var transaction = new Transaction();
            transaction.setUserId(loggedInUserId);
            transaction.setStatus(TransactionStatus.CREATED);

            tasks.push(self.phoneCallDelegate.create(phoneCall)
                .then(
                function phoneCallCreated(createdCall:PhoneCall)
                {
                    sessionData.setCall(createdCall);
                    return self.transactionDelegate.createPhoneCallTransaction(transaction, createdCall);
                })
                .then(
                function transactionCreated(createdTransaction:Transaction)
                {
                    sessionData.setTransaction(createdTransaction);
                    return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, createdTransaction.getId()))
                }));
        }

        // If logged in, fetch associated phone numbers
        if (req.isAuthenticated())
        {
            var userPhoneSearch = {};
            userPhoneSearch[UserPhone.USER_ID] = loggedInUserId;
            userPhoneSearch[UserPhone.VERIFIED] = true;

            tasks.push(self.userPhoneDelegate.search(userPhoneSearch)
                .fail(
                function userPhoneFetchFailed(error)
                {
                    self.logger.error('User phone fetch error. Error: %s', error);
                    return null;
                }));
        }

        // Execute all tasks and render
        q.all(tasks)
            .then(
            function allDone(...args)
            {
                var lines = args[0][0];
                var phoneNumbers = args[0][1];

                var pageData = _.extend(sessionData.getData(), {
                    messages: req.flash(),
                    userPhones: phoneNumbers,
                    transactionLines: lines
                });

                res.render(CallFlowRoute.PAYMENT, pageData);
            });
    }

    /* Apply coupon and send back discount details */
    private applyCoupon(req:express.Request, res:express.Response)
    {
        var self = this;
        var couponCode:string = req.query[ApiConstants.CODE];
        var sessionData:SessionData = new SessionData(req);
        var transaction = sessionData.getTransaction();

        self.transactionDelegate.applyCoupon(transaction.getId(), couponCode)
            .then(
            function couponApplied()
            {
                return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, transaction.getId()))
            })
            .then(
            function transactionLinesFetched(lines:TransactionLine[]) { res.send(lines); },
            function couponApplyFailed(error) { res.send(500, error); }
        );
    }

    /* Handle user login just before checkout */
    private handleLoginJustBeforeCheckout(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);

        // 1. Create user phone entry for phone number in session
        // 2. Update user id in transaction and call entries

        var dbTransaction;
        var transaction = sessionData.getTransaction();
        var call = sessionData.getCall();

        MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                dbTransaction = t;

                return q.all([
                    self.phoneCallDelegate.update(call.getId(), Utils.createSimpleObject(PhoneCall.CALLER_USER_ID, sessionData.getLoggedInUser().getId()), dbTransaction),
                    self.transactionDelegate.update(transaction.getId(), Utils.createSimpleObject(Transaction.USER_ID, sessionData.getLoggedInUser().getId()), dbTransaction)
                ]);
            })
            .then(
            function userIdUpdated()
            {
                return MysqlDelegate.commit(dbTransaction);
            });
    }

    /* Redirect to gateway for payment */
    private checkout(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var transaction = sessionData.getTransaction();

        var callerPhone = new UserPhone();
        callerPhone.setPhone(sessionData.getCallerPhone());
        callerPhone.setUserId(sessionData.getLoggedInUser().getId());

        self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, transaction.getId()))
            .then(
            function transactionLinesFetched(lines:TransactionLine[])
            {
                var payZippyProvider = new PayZippyProvider();
                var amount:number = _.reduce(_.pluck(lines, TransactionLine.AMOUNT), function (memo:number, num:number) { return memo + num; }, 0) * 100

                res.redirect(payZippyProvider.getPaymentUrl(transaction, amount, sessionData.getLoggedInUser()));
            });
    }
}

export = CallFlowRoute