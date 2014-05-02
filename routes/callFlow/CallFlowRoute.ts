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
import Coupon                                               = require('../../models/Coupon');
import UserPhone                                            = require('../../models/UserPhone');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import MoneyUnit                                            = require('../../enums/MoneyUnit');
import TransactionStatus                                    = require('../../enums/TransactionStatus');
import Formatter                                            = require('../../common/Formatter');
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
    private phoneCallDelegate = new PhoneCallDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();

    constructor(app, secureApp)
    {
        // Actual rendered pages
        app.get(Urls.callExpert(), this.index.bind(this));
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

    /* Validate request from caller and start a new transaction */
    private callPayment(req, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var self = this;

        function renderPage(phoneNumbers)
        {
            var pageData = _.extend(sessionData.getData(), {
                messages: req.flash(),
                userPhones: phoneNumbers
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
        var loggedInUserId = sessionData.getLoggedInUser().getId();

        var phoneCall = new PhoneCall();
        phoneCall.setIntegrationMemberId(sessionData.getExpert().getId());
        phoneCall.setCallerUserId(req[ApiConstants.USER].id);
        phoneCall.setDelay(0);
        phoneCall.setStatus(CallStatus.PLANNING);
        phoneCall.setDuration(sessionData.getDuration());
        phoneCall.setPricePerMin(12);
        phoneCall.setPriceCurrency(MoneyUnit.DOLLAR);

        var transaction = new Transaction();
        transaction.setUserId(loggedInUserId);
        transaction.setStatus(TransactionStatus.CREATED);

        // TODO: Verify that supplied phone number belongs to logged in user
        var self = this;
        var sessionData = new SessionData(req);
        var userPhoneId:number = parseInt(req.body[ApiConstants.PHONE_NUMBER_ID]);
        var call = sessionData.getCall();
        call.setCallerPhoneId(userPhoneId);

        self.phoneCallDelegate.update(sessionData.getCallId(), Utils.createSimpleObject(PhoneCall.CALLER_PHONE_ID, userPhoneId))
            .then(
            function phoneNumberUpdated()
            {
                // Redirect to payment gateway
            });
    }
}

export = CallFlowRoute