import _                                                    = require('underscore');
import passport                                             = require('passport');
import q                                                    = require('q');
import express                                              = require('express');
import MysqlDelegate                                        = require('../../delegates/MysqlDelegate');
import PhoneCallDelegate                                    = require('../../delegates/PhoneCallDelegate');
import TransactionDelegate                                  = require('../../delegates/TransactionDelegate');
import TransactionLineDelegate                              = require('../../delegates/TransactionLineDelegate');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import UserPhoneDelegate                                    = require('../../delegates/UserPhoneDelegate');
import CouponDelegate                                       = require('../../delegates/CouponDelegate');
import PricingSchemeDelegate                                = require('../../delegates/PricingSchemeDelegate');
import NotificationDelegate                                 = require('../../delegates/NotificationDelegate');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');
import PayZippyProvider                                     = require('../../providers/PayZippyProvider');
import PhoneCall                                            = require('../../models/PhoneCall');
import Transaction                                          = require('../../models/Transaction');
import Coupon                                               = require('../../models/Coupon');
import UserPhone                                            = require('../../models/UserPhone');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import TransactionLine                                      = require('../../models/TransactionLine');
import UserProfile                                          = require('../../models/UserProfile');
import User                                                 = require('../../models/User');
import PricingScheme                                        = require('../../models/PricingScheme');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import MoneyUnit                                            = require('../../enums/MoneyUnit');
import PhoneType                                            = require('../../enums/PhoneType');
import TransactionStatus                                    = require('../../enums/TransactionStatus');
import TransactionType                                      = require('../../enums/TransactionType');
import ItemType                                             = require('../../enums/ItemType');
import Formatter                                            = require('../../common/Formatter');
import Utils                                                = require('../../common/Utils');
import Config                                               = require('../../common/Config');
import CallFlowSessionData                                  = require('../callFlow/SessionData');

import Urls                                                 = require('./Urls');
import Middleware                                           = require('./Middleware');

class PaymentRoute
{
    private static PAYMENT:string                           = 'payment/payment';
    private static PAYMENT_COMPLETE:string                  = 'payment/paymentComplete';

    private notificationDelegate = new NotificationDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private transactionDelegate = new TransactionDelegate();
    private transactionLineDelegate = new TransactionLineDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private couponDelegate = new CouponDelegate();

    constructor(app)
    {
        app.get(Urls.payment(), Middleware.requireCallerAndCallDetails, Middleware.ensureNotCallingSelf, this.callPaymentPage.bind(this));

        app.post(Urls.payment(), Middleware.requireCallerAndCallDetails, Middleware.ensureNotCallingSelf, this.callPayment.bind(this));
        app.post(Urls.coupon(), Middleware.ensureNotCallingSelf, Middleware.requireTransaction, this.applyCoupon.bind(this));
        app.post(Urls.checkout(), Middleware.ensureNotCallingSelf, Middleware.requireTransaction, this.checkout.bind(this));
        app.get(Urls.removeCoupon(), Middleware.ensureNotCallingSelf, Middleware.requireTransaction, this.removeCoupon.bind(this));

        app.post(Urls.paymentCallback(), this.paymentComplete.bind(this));
        app.get(Urls.paymentCallback(), this.paymentComplete.bind(this));
    }

    /* Redirect to convert post to get
     * Note: We're doing a POST so that user selected params don't appear in url*/
    private callPayment(req, res:express.Response)
    {
        res.redirect(Urls.payment());
    }

    /* Validate request from caller and start a new transaction */
    private callPaymentPage(req, res:express.Response)
    {
        var callFlowSessionData = new CallFlowSessionData(req);
        var self = this;
        var user = callFlowSessionData.getUser();
        var loggedInUserId = req.isAuthenticated() ? callFlowSessionData.getLoggedInUser().getId() : null;
        var tasks = [];

        // Delete transaction and call if anything was changed
        var transactionExists:boolean = !Utils.isNullOrEmpty(callFlowSessionData.getTransaction());
        if (transactionExists)
        {
            var isExpertChanged = callFlowSessionData.getCall().getExpertUserId() != callFlowSessionData.getUser().getId();
            var isDurationChanged = callFlowSessionData.getCall().getDuration() != callFlowSessionData.getDuration();
            var isAgendaChanged = callFlowSessionData.getCall().getAgenda() != callFlowSessionData.getAgenda();

            if (isExpertChanged || isDurationChanged || isAgendaChanged)
            {
                tasks.push(self.transactionDelegate.delete(callFlowSessionData.getTransaction().getId()));
                tasks.push(self.phoneCallDelegate.delete(callFlowSessionData.getCall().getId()));
            }
        }

        // Create transaction and call if anything was changed or if transaction wasn't already started
        if (!transactionExists || isExpertChanged || isDurationChanged || isAgendaChanged)
        {
            var phoneCall = new PhoneCall();
            phoneCall.setExpertUserId(callFlowSessionData.getUser().getId());
            phoneCall.setDelay(0);
            phoneCall.setStatus(CallStatus.PLANNING);
            phoneCall.setDuration(callFlowSessionData.getDuration()*60);
            phoneCall.setAgenda(callFlowSessionData.getAgenda());
            phoneCall.setChargingRate(new PricingScheme(user.getPricingScheme()[0]).getChargingRate());
            phoneCall.setUnit(new PricingScheme(user.getPricingScheme()[0]).getUnit());
            phoneCall.setPulseRate(new PricingScheme(user.getPricingScheme()[0]).getPulseRate());
            phoneCall.setMinDuration(new PricingScheme(user.getPricingScheme()[0]).getMinDuration());
            phoneCall.setCallerUserId(loggedInUserId);

            var transaction = new Transaction();
            transaction.setUserId(loggedInUserId);
            transaction.setStatus(TransactionStatus.CREATED);

            tasks.push(self.phoneCallDelegate.create(phoneCall)
                .then(
                function phoneCallCreated(createdCall:PhoneCall)
                {
                    callFlowSessionData.setCall(createdCall);
                    return self.transactionDelegate.createPhoneCallTransaction(transaction, createdCall);
                })
                .then(
                function transactionCreated(createdTransaction:Transaction)
                {
                    callFlowSessionData.setTransaction(createdTransaction);
                    return true;
                }));
        }

        // Execute all tasks and render
        q.all(tasks)
            .then(
            function allDone(...args)
            {
                return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.COL_TRANSACTION_ID, callFlowSessionData.getTransaction().getId()));
            }).
            then(function transactionLinesFetched(lines:TransactionLine[])
            {
                lines = _.sortBy(lines, function (line:TransactionLine)
                {
                    return line.getTransactionType();
                });

                // If discount applied, fetch coupon name
                var discountLine = _.findWhere(lines, Utils.createSimpleObject(TransactionLine.COL_TRANSACTION_TYPE, TransactionType.DISCOUNT));
                if (Utils.isNullOrEmpty(discountLine))
                    return [lines];
                else
                    return [lines, self.couponDelegate.get(discountLine.getItemId())];
            })
            .spread(
            function linesAndCouponFetched(...args)
            {
                var lines = args[0];
                var coupon = args[1];

                var pageData = _.extend(callFlowSessionData.getData(), {
                    messages: req.flash(),
                    transactionLines: lines,
                    coupon: coupon
                });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(PaymentRoute.PAYMENT, pageData);
            },
            function handleError(error) { res.send(500); });
    }

    /* Apply coupon and send back discount details */
    private applyCoupon(req:express.Request, res:express.Response)
    {
        var self = this;
        var couponCode:string = req.body[ApiConstants.CODE];
        var sessionData = new CallFlowSessionData(req);
        var transaction = sessionData.getTransaction();

        self.transactionDelegate.applyCoupon(transaction.getId(), couponCode)
            .then(
            function transactionLinesFetched() { res.redirect(Urls.payment()); },
            function couponApplyFailed(error)
            {
                req.flash('error', JSON.stringify(error));
                res.redirect(Urls.payment());
            });
    }

    private removeCoupon(req:express.Request, res:express.Response)
    {
        var self = this;

        var sessionData = new CallFlowSessionData(req);
        var transaction = sessionData.getTransaction();

        var couponCode:string = req.query[ApiConstants.CODE];

        self.transactionDelegate.removeCoupon(transaction.getId(),couponCode)
            .then(
            function couponRemoved() { res.redirect(Urls.payment()); },
            function couponRemoveFailed(error)
            {
                req.flash('error', JSON.stringify(error));
                res.redirect(Urls.payment());
            });
    }

    /* Redirect to gateway for payment */
    private checkout(req, res:express.Response)
    {
        var self = this;
        var sessionData = new CallFlowSessionData(req);
        var transaction = sessionData.getTransaction();
        var call = sessionData.getCall();
        var dbTransaction:Object;

        // Check that we've a valid call for scheduling
        var isCallValid = !Utils.isNullOrEmpty(call.getAgenda())
            && !Utils.isNullOrEmpty(sessionData.getAppointments())

        if (!isCallValid)
        {
            res.render('500', {error: 'An error occurred while scheduling your call. Please try again.'});
            return null;
        }

        var userPhone = new UserPhone();
        userPhone.setAreaCode(sessionData.getAreaCode());
        userPhone.setCountryCode(sessionData.getCountryCode());
        userPhone.setPhone(sessionData.getCallerPhone());
        userPhone.setUserId(sessionData.getLoggedInUser().getId());

        // 1. Begin sql transaction
        // 2. Create phone number entry
        // 3. Associate logged in user with call and transaction
        // 4. Associate phone number with call
        // 5. Redirect to checkout
        MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                dbTransaction = t;
                return self.userPhoneDelegate.create(userPhone, dbTransaction);
            })
            .then(
            function phoneNumberCreated(createdPhone:UserPhone)
            {
                var userId = sessionData.getLoggedInUser().getId();

                var phoneCallUpdates = {};
                phoneCallUpdates[PhoneCall.COL_CALLER_PHONE_ID] = createdPhone.getId();
                phoneCallUpdates[PhoneCall.COL_CALLER_USER_ID] = userId;

                return q.all([
                    self.phoneCallDelegate.update(call.getId(), phoneCallUpdates, dbTransaction),
                    self.transactionDelegate.update(transaction.getId(), Utils.createSimpleObject(Transaction.COL_USER_ID, userId), dbTransaction)
                ]);
            })
            .then(
            function transactionAndCallUpdated()
            {
                return MysqlDelegate.commit(dbTransaction);
            })
            .then(
            function transactionCommitted()
            {
                return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.COL_TRANSACTION_ID, transaction.getId()), null, null, dbTransaction);
            })
            .then(
            function transactionLinesFetched(lines:TransactionLine[])
            {
                var payZippyProvider = new PayZippyProvider();
                var amount:number = _.reduce(_.pluck(lines, TransactionLine.COL_AMOUNT), function (memo:number, num:number) { return memo + num; }, 0) * 100;

                if (amount > 0)
                    res.redirect(payZippyProvider.getPaymentUrl(transaction, parseFloat(amount.toFixed(2)), sessionData.getLoggedInUser()));
                else
                    res.redirect(Urls.paymentCallback() + '?noPayment=true');
            },
            function handleError(error)
            {
                req.flash({error: JSON.stringify(error)});
                res.redirect(Urls.payment());
            });
    }

    /* Handle payment response from gateway */
    private paymentComplete(req:express.Request, res:express.Response)
    {
        var self = this;
        var callFlowSessionData = new CallFlowSessionData(req);
        var payZippyProvider = new PayZippyProvider();
        var noPayment = req.query[ApiConstants.NO_PAYMENT];

        // 1. Fetch transaction lines for the successful transaction
        // 2. Update transaction status
        // 3. Take next actions based on products in the transaction
        payZippyProvider.handleResponse(req)
            .then(
            function responseProcessed(transactionId:number)
            {
                return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.COL_TRANSACTION_ID, transactionId))
            },
            function responseProcessingFailed(error:Error)
            {
                if (error.message == 'HASH_MISMATCH' && noPayment)
                {
                    var transactionId = callFlowSessionData.getTransaction().getId();
                    return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.COL_TRANSACTION_ID, transactionId))
                }
                else
                    throw(error);
            })
            .then(
            function transactionLinesFetched(lines:TransactionLine[])
            {
                // Assumption: We only have one call on the transaction
                var callId = _.findWhere(lines, {item_type: ItemType.PHONE_CALL}).getItemId();
                return [lines, self.phoneCallDelegate.get(callId, null, [PhoneCall.FK_PHONE_CALL_EXPERT])];
            })
            .spread(
            function callFetched(lines:TransactionLine[], call:PhoneCall)
            {
                lines = _.sortBy(lines, function (line:TransactionLine)
                {
                    return line.getTransactionType();
                });

                // 1. Update call status
                // 2. Send notifications
                return q.all([
                    self.phoneCallDelegate.update(call.getId(), {status: CallStatus.SCHEDULING}),
                    self.notificationDelegate.sendNewCallRequestNotifications(call, callFlowSessionData.getAppointments(), call.getDuration()/60, callFlowSessionData.getLoggedInUser())
                ])
                    .then(
                    function renderPage()
                    {
                        var pageData = _.extend(callFlowSessionData.getData(), {
                            transactionLines: lines,
                            call: call
                        });
                        callFlowSessionData.setTransaction(null);
                        callFlowSessionData.setCall(null);
                        callFlowSessionData.setAppointments([]);

                        delete req.session[CallFlowSessionData.IDENTIFIER]
                        res.render(PaymentRoute.PAYMENT_COMPLETE, pageData);
                    });
            })
            .fail(
            function handleError(error)
            {
                var pageData = _.extend(callFlowSessionData.getData(), {
                    error: error
                });

                callFlowSessionData.setTransaction(null);
                callFlowSessionData.setCall(null);
                callFlowSessionData.setAppointments([]);

                res.render(PaymentRoute.PAYMENT_COMPLETE, pageData);
            });
    }

    private putTimezoneInSession(req:express.Request, res:express.Response, next:Function)
    {
        req.session[ApiConstants.ZONE] = parseInt(req.query[ApiConstants.ZONE]);
        next();
    }

}
export = PaymentRoute