///<reference path='../../_references.d.ts'/>
import connect_ensure_login                                 = require('connect-ensure-login');
import url                                                  = require('url');
import q                                                    = require('q');
import _                                                    = require('underscore');
import moment                                               = require('moment');
import express                                              = require('express');
import passport                                             = require('passport');
import log4js                                               = require('log4js');
import crypto                                               = require('crypto');
import RequestHandler                                       = require('../../middleware/RequestHandler');
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
        app.post(Urls.applyCoupon(), Middleware.requireCallerAndCallDetails, this.applyCoupon.bind(this))
        app.post(Urls.checkout(), connect_ensure_login.ensureLoggedIn(), Middleware.requireCallerAndCallDetails, this.checkout.bind(this));
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

        function renderPage(phoneNumbers)
        {
            var dummyPhoneCall = new PhoneCall();
            dummyPhoneCall.setDuration(sessionData.getDuration());
            dummyPhoneCall.setPricePerMin(expert.getSchedule()[0][ExpertSchedule.PRICE_PER_MIN]);
            dummyPhoneCall.setPriceCurrency(expert.getSchedule()[0][ExpertSchedule.PRICE_UNIT]);

            var dummyTransactionLines = self.transactionLineDelegate.getPhoneCallTransactionLines(dummyPhoneCall);
            _.sortBy(dummyTransactionLines, function () { return TransactionLine.TRANSACTION_TYPE });

            var pageData = _.extend(sessionData.getData(), {
                messages: req.flash(),
                userPhones: phoneNumbers,
                transactionLines: dummyTransactionLines
            });

            res.render(CallFlowRoute.PAYMENT, pageData);
        };

        if (req.isAuthenticated())
        {
            var loggedInUserId = sessionData.getLoggedInUser().getId();
            var userPhoneSearch = {};
            userPhoneSearch[UserPhone.USER_ID] = loggedInUserId;
            userPhoneSearch[UserPhone.VERIFIED] = true;

            self.userPhoneDelegate.search(userPhoneSearch)
                .fail(
                function userPhoneFetchFailed(error)
                {
                    self.logger.error('User phone fetch error. Error: %s', error);
                    return null;
                })
                .then(renderPage)
                .fail(
                function handleError(error)
                {
                    self.logger.error('Failure on payment page. Error: %s', JSON.stringify(error));
                    res.send(500);
                });
        }
        else
            renderPage(null);
    }

    /* Apply coupon and send back discount details */
    private applyCoupon(req:express.Request, res:express.Response)
    {
        var self = this;
        var couponCode:string = req.query[ApiConstants.CODE];
        var sessionData:SessionData = new SessionData(req);
        var expert = sessionData.getExpert();


    }

    /* Validate everything, create a transaction (and phone call record) and redirect to payment */
    private checkout(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var loggedInUserId = sessionData.getLoggedInUser().getId();
        var expert = sessionData.getExpert();

        // TODO: Verify that supplied phone number belongs to logged in user
        var self = this;
        var sessionData = new SessionData(req);

        var callerPhone = new UserPhone();
        callerPhone.setPhone(sessionData.getCallerPhone());
        callerPhone.setUserId(sessionData.getLoggedInUser().getId());

        var phoneCall = new PhoneCall();
        phoneCall.setIntegrationMemberId(sessionData.getExpert().getId());
        phoneCall.setCallerUserId(req[ApiConstants.USER].id);
        phoneCall.setDelay(0);
        phoneCall.setStatus(CallStatus.PLANNING);
        phoneCall.setDuration(sessionData.getDuration());
        phoneCall.setPricePerMin(expert.getSchedule()[0][ExpertSchedule.PRICE_PER_MIN]);
        phoneCall.setPriceCurrency(expert.getSchedule()[0][ExpertSchedule.PRICE_UNIT]);

        var transaction = new Transaction();
        transaction.setUserId(loggedInUserId);
        transaction.setStatus(TransactionStatus.CREATED);

        self.userPhoneDelegate.create(callerPhone)
            .then(
            function phoneCreated(phone:UserPhone)
            {
                phoneCall.setCallerPhoneId(phone.getId());
                return self.phoneCallDelegate.create(phoneCall);
            })
            .then(
            function phoneCallCreated(c:PhoneCall)
            {
                return self.transactionDelegate.createPhoneCallTransaction(transaction, c);
            })
            .then(
            function transactionCreated(transaction)
            {
                return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, transaction.getId()));
            })
            .then(
            function transactionLinesFetched(lines:TransactionLine[])
            {
                // Redirect to payzippy
                var data = {
                    buyer_email_address: sessionData.getLoggedInUser().getEmail(),
                    buyer_unique_id: sessionData.getLoggedInUser().getId(),
                    callback_url: url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.paymentCallback()),
                    currency: "INR",
                    hash_method: 'MD5',
                    is_user_logged_in: true,
                    merchant_id: Config.get(Config.PAY_ZIPPY_MERCHANT_ID),
                    merchant_key_id: Config.get(Config.PAY_ZIPPY_MERCHANT_KEY_ID),
                    merchant_transaction_id: transaction.getId(),
                    payment_method: null,
                    transaction_amount: _.reduce(_.pluck(lines, TransactionLine.AMOUNT), function(memo:number, num:number){ return memo + num; }, 0) * 100,
                    transaction_type: 'sale',
                    ui_mode: 'redirect'
                };

                var concatString = _.values(data).concat(Config.get(Config.PAY_ZIPPY_SECRET_KEY)).join('|');
                var md5sum = crypto.createHash('md5');
                var hash:string = md5sum.update(concatString).digest('hex');

                data['hash'] = hash;

                var payZippyUrl:string = Config.get(Config.PAY_ZIPPY_CHARGING_URI);
                payZippyUrl = Utils.addQueryToUrl(payZippyUrl, data);

                res.redirect(payZippyUrl);
            });
    }
}

export = CallFlowRoute