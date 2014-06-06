///<reference path='../../_references.d.ts'/>
import connect_ensure_login                                 = require('connect-ensure-login');
import q                                                    = require('q');
import _                                                    = require('underscore');
import moment                                               = require('moment');
import express                                              = require('express');
import passport                                             = require('passport');
import log4js                                               = require('log4js');
import RequestHandler                                       = require('../../middleware/RequestHandler');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import PhoneCallDelegate                                    = require('../../delegates/PhoneCallDelegate');
import TransactionLineDelegate                              = require('../../delegates/TransactionLineDelegate');
import UserPhoneDelegate                                    = require('../../delegates/UserPhoneDelegate');
import Utils                                                = require('../../common/Utils');
import Config                                               = require('../../common/Config');
import Formatter                                            = require('../../common/Formatter');
import PhoneCall                                            = require('../../models/PhoneCall');
import ExpertSchedule                                       = require('../../models/ExpertSchedule');
import Transaction                                          = require('../../models/Transaction');
import Coupon                                               = require('../../models/Coupon');
import UserPhone                                            = require('../../models/UserPhone');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import User                                                 = require('../../models/User');
import TransactionLine                                      = require('../../models/TransactionLine');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import MoneyUnit                                            = require('../../enums/MoneyUnit');
import TransactionStatus                                    = require('../../enums/TransactionStatus');
import TransactionType                                      = require('../../enums/TransactionType');

import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');
import CallFlowUrls                                         = require('../callFlow/Urls');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');

class CallSchedulingRoute
{
    private static SCHEDULING_PAGE_FOR_EXPERT:string        = 'callScheduling/schedulingPageForExpert';
    private static SCHEDULING_PAGE_FOR_CALLER:string        = 'callScheduling/schedulingPageForCaller';

    private verificationCodeDelegate = new VerificationCodeDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private transactionLineDelegate = new TransactionLineDelegate();

    constructor(app, secureApp)
    {
        // Actual rendered pages
        app.get(Urls.scheduling(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.scheduling.bind(this));
    }

    /**
     * Invoked when expert/caller clicks on accept appointment link in email
     * */
    private scheduling(req:express.Request, res:express.Response)
    {
        var self = this;
        var startTime:number = parseInt(req.query[ApiConstants.START_TIME]);
        var appointmentCode:string = req.query[ApiConstants.CODE];
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var loggedInUserId = req[ApiConstants.USER].id;

        // 0. Check that selected start time hasn't already passed (expert reads the email too late)
        // 1. Validate the code
        //      a. verify that selected slot is one of the original slots
        //      b. Verify that request was not sent by me
        // 2. Fetch call details
        // 3. If expert, check that we've a verified mobile number else ask to verify
        if (startTime < moment().valueOf())
        {
            res.render('500', {error: 'The selected start time(' + Formatter.formatDate(startTime) + ') has already passed. Please choose another slot from the suggested slots or suggest a new one'});
            return;
        }

        q.all([
            this.verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode),
            self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_TRANSACTION_LINE])
        ])
            .then(
            function callAndSchedulingDetailsFetched(...args)
            {
                var appointment = args[0][0];
                var call:PhoneCall = args[0][1];

                if (Utils.isNullOrEmpty(appointment) || (!Utils.isNullOrEmpty(startTime) && !_.contains(appointment.startTimes, startTime)) || appointment.from == loggedInUserId)
                    throw 'Invalid request. Please click on one of the links in the email';

                var returnArray = [appointment.startTimes, call];

                switch (loggedInUserId)
                {
                    // If viewer == expert
                    case call.getIntegrationMember().getUser().getId():
                        if (!Utils.isNullOrEmpty(call.getExpertPhoneId()))
                            returnArray.push(self.userPhoneDelegate.get(call.getExpertPhoneId()));
                        else
                            returnArray.push(self.userPhoneDelegate.find(Utils.createSimpleObject(UserPhone.USER_ID, call.getIntegrationMember().getUserId())));

                    // If viewer == caller
                    case call.getCallerUserId():
                        returnArray.push(self.userPhoneDelegate.get(call.getCallerPhoneId()));
                }

                return returnArray;
            })
            .spread(
            function expertPhonesFetched(startTimes:number[], call:PhoneCall, phone:UserPhone):any
            {
                var lines = call.getTransactionLine();
                var productLine = _.findWhere(lines, Utils.createSimpleObject(TransactionLine.TRANSACTION_TYPE, TransactionType.PRODUCT));
                var revenueShare:number = call.getIntegrationMember().getRevenueShare();
                var revenueShareUnit:MoneyUnit = call.getIntegrationMember().getRevenueShareUnit();

                var earning:number = 0;
                var earningUnit:MoneyUnit = revenueShareUnit;

                switch(revenueShareUnit)
                {
                    case MoneyUnit.PERCENT:
                        earning = revenueShare * productLine.getAmount() / 100;
                        break;

                    default:
                        // TODO: Handle currency conversion if different currencies
                        if (revenueShareUnit == productLine.getAmountUnit())
                            earning = Math.min(productLine.getAmount(), revenueShare);
                        break;
                }

                var pageData = {
                    call: call,
                    startTimes: startTimes,
                    selectedStartTime: startTime,
                    phone: phone,
                    code: appointmentCode,
                    lines: lines,
                    loggedInUserId: loggedInUserId,
                    earning: earning,
                    earningUnit: earningUnit
                };

                if (loggedInUserId == call.getIntegrationMember().getUser().getId())
                    res.render(CallSchedulingRoute.SCHEDULING_PAGE_FOR_EXPERT, pageData);
                else if (loggedInUserId == call.getCallerUserId())
                    res.render(CallSchedulingRoute.SCHEDULING_PAGE_FOR_CALLER, pageData);
                else
                    res.render('500', "You're not authorized to view this page");

            })
            .fail(function (error)
            {
                res.render('500', {error: error});
            });
    }
}
export = CallSchedulingRoute