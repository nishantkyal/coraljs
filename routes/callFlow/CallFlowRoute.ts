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
import PhoneCallDelegate                                    = require('../../delegates/PhoneCallDelegate');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import TransactionDelegate                                  = require('../../delegates/TransactionDelegate');
import TransactionLineDelegate                              = require('../../delegates/TransactionLineDelegate');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import UserPhoneDelegate                                    = require('../../delegates/UserPhoneDelegate');
import UserProfileDelegate                                  = require('../../delegates/UserProfileDelegate');
import NotificationDelegate                                 = require('../../delegates/NotificationDelegate');
import UserDelegate                                         = require('../../delegates/UserDelegate');
import ScheduleDelegate                                     = require('../../delegates/ScheduleDelegate');
import ScheduleExceptionDelegate                            = require('../../delegates/ScheduleExceptionDelegate');
import CouponDelegate                                       = require('../../delegates/CouponDelegate');
import PricingSchemeDelegate                                = require('../../delegates/PricingSchemeDelegate');
import TimezoneDelegate                                     = require('../../delegates/TimezoneDelegate');
import PhoneCallReviewDelegate                              = require('../../delegates/PhoneCallReviewDelegate');
import PhoneCall                                            = require('../../models/PhoneCall');
import Schedule                                             = require('../../models/Schedule');
import Transaction                                          = require('../../models/Transaction');
import Coupon                                               = require('../../models/Coupon');
import UserPhone                                            = require('../../models/UserPhone');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import TransactionLine                                      = require('../../models/TransactionLine');
import UserProfile                                          = require('../../models/UserProfile');
import ScheduleException                                    = require('../../models/ScheduleException');
import User                                                 = require('../../models/User');
import PhoneCallReview                                      = require('../../models/PhoneCallReviewModel');
import PricingScheme                                        = require('../../models/PricingScheme');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import MoneyUnit                                            = require('../../enums/MoneyUnit');
import PhoneType                                            = require('../../enums/PhoneType');
import TransactionStatus                                    = require('../../enums/TransactionStatus');
import TransactionType                                      = require('../../enums/TransactionType');
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
    private static SCHEDULING_PAGE_FOR_EXPERT:string = 'callFlow/schedulingPageForExpert';
    private static SCHEDULING_PAGE_FOR_CALLER:string = 'callFlow/schedulingPageForCaller';
    private static REVIEW_PAGE_FOR_EXPERT:string = 'callFlow/reviewPageForExpert';
    private static REVIEW_PAGE_FOR_CALLER:string = 'callFlow/reviewPageForCaller';

    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private phoneCallDelegate = new PhoneCallDelegate();
    private userProfileDelegate = new UserProfileDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private userDelegate = new UserDelegate();
    private scheduleExceptionDelegate = new ScheduleExceptionDelegate();
    private scheduleDelegate = new ScheduleDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private timezoneDelegate = new TimezoneDelegate();
    private phoneCallReviewDelegate = new PhoneCallReviewDelegate();

    constructor(app)
    {
        app.get(Urls.callExpert(), this.index.bind(this));
        app.get(Urls.scheduling(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.scheduling.bind(this));
        app.get(Urls.review(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.createReview.bind(this));
        app.get(Urls.reviewById(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.review.bind(this));
    }

    /* Render index with expert schedules */
    // Validate that the expert has completed his profile and account is active
    private index(req:express.Request, res:express.Response)
    {
        var self = this;
        var userId = parseInt(req.params[ApiConstants.USER_ID]);
        var sessionData = new SessionData(req);

        return q.all([
            self.userProfileDelegate.find(Utils.createSimpleObject(UserProfile.COL_USER_ID, userId)),
            self.phoneCallDelegate.getScheduledCalls(userId),
            self.scheduleExceptionDelegate.search(Utils.createSimpleObject(ScheduleException.COL_USER_ID, userId), [Schedule.COL_START_TIME, Schedule.COL_DURATION]),
            self.userDelegate.get(userId, null, [User.FK_USER_PRICING_SCHEME, User.FK_USER_SKILL]),
            self.scheduleDelegate.getSchedulesForUser(userId)
        ])
            .then(
            function userProfileFetched(...args):any
            {
                var userProfile:UserProfile = args[0][0];
                var scheduledCalls:PhoneCall[] = args[0][1];
                var scheduleExceptions:ScheduleException[] = args[0][2];
                var user:User = args[0][3];
                var schedule:Schedule[] = args[0][4];

                var exceptions = [];

                if (!Utils.isNullOrEmpty(scheduledCalls))
                    exceptions = exceptions.concat(_.map(scheduledCalls, function (call:PhoneCall)
                    {
                        return {duration: call.getDuration(), start_time: call.getStartTime()}
                    }));

                if (!Utils.isNullOrEmpty(scheduleExceptions))
                    exceptions = exceptions.concat(_.map(scheduleExceptions, function (exception:ScheduleException)
                    {
                        return {duration: exception.getDuration(), start_time: exception.getStartTime()}
                    }));

                sessionData.setUser(user);
                sessionData.setSchedule(schedule);
                sessionData.setExpertGmtOffset(self.timezoneDelegate.get(user.getTimezone()).getGmtOffset() * 1000);

                var pageData = _.extend(sessionData.getData(), {
                    userProfile: userProfile,
                    schedule: schedule,
                    exception: exceptions,
                    messages: req.flash()
                });

                res.render(CallFlowRoute.INDEX, pageData);
            },
            function handleExpertSearchFailed(error)
            {
                self.logger.error('Error in getting expert details - ' + error);
                throw new Error('No such expert exists!');
            })
            .fail(
            function handleFailed(error:Error)
            {
                res.render('500', {error: error.message});
            });
    }

    /**
     * Invoked when expert/caller clicks on accept appointment link in email
     **/
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
        if (startTime  && startTime < moment().valueOf())
        {
            res.render('500', {error: 'The selected start time(' + Formatter.formatDate(startTime) + ') has already passed. Please choose another slot from the suggested slots or suggest a new one'});
            return;
        }

        q.all([
            self.verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode),
            self.phoneCallDelegate.get(callId, null, [PhoneCall.FK_PHONE_CALL_EXPERT, PhoneCall.FK_PHONE_CALL_CALLER])
        ])
            .then(
            function callAndSchedulingDetailsFetched(...args)
            {
                var appointment = args[0][0];
                var call:PhoneCall = args[0][1];

                if (Utils.isNullOrEmpty(appointment) || (!Utils.isNullOrEmpty(startTime) && !_.contains(appointment.startTimes, startTime)) || appointment.from == loggedInUserId)
                    throw new Error('Invalid request. Please click on one of the links in the email');

                var returnArray = [appointment.startTimes, call, call.getExpertUser()];

                switch (loggedInUserId)
                {
                    // If viewer == expert
                    case call.getExpertUserId():
                        if (!Utils.isNullOrEmpty(call.getExpertPhoneId()))
                            returnArray.push(call.getExpertPhone());
                        else
                            returnArray.push(self.userPhoneDelegate.find(Utils.createSimpleObject(UserPhone.COL_USER_ID, call.getExpertUserId())));

                    // If viewer == caller
                    case call.getCallerUserId():
                        returnArray.push(call.getUserPhone());
                }

                return returnArray;
            })
            .spread(
            function expertPhonesFetched(startTimes:number[], call:PhoneCall, expert:User, phone:UserPhone):any
            {
                /*var lines = call.getTransactionLine();
                 var productLine:TransactionLine = _.findWhere(lines, Utils.createSimpleObject(TransactionLine.COL_TRANSACTION_TYPE, TransactionType.PRODUCT));*/
                /*var revenueShare:number = call.getIntegrationMember().getRevenueShare();
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
                 }*/

                var pageData = {
                    call: call,
                    startTimes: startTimes,
                    selectedStartTime: startTime,
                    phone: phone,
                    code: appointmentCode,
                    loggedInUserId: loggedInUserId,
                    expertGmtOffset: self.timezoneDelegate.get(expert.getTimezone()).getGmtOffset() * 1000,
                    userGmtOffset: self.timezoneDelegate.get(expert.getTimezone()).getGmtOffset() * 1000
                };

                if (loggedInUserId == call.getExpertUserId())
                    res.render(CallFlowRoute.SCHEDULING_PAGE_FOR_EXPERT, pageData);
                else if (loggedInUserId == call.getCallerUserId())
                    res.render(CallFlowRoute.SCHEDULING_PAGE_FOR_CALLER, pageData);
                else
                    res.render('500', "You're not authorized to view this page");

            })
            .fail(function (error)
            {
                res.render('500', {error: error});
            });
    }

    private createReview(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var loggedInUserId = req[ApiConstants.USER].id;
        var review:number = parseInt(req.query[ApiConstants.REVIEW]) || 0;

        var phoneCallReview:PhoneCallReview = new PhoneCallReview();

        phoneCallReview.setUserId(loggedInUserId);
        phoneCallReview.setCallId(callId);
        phoneCallReview.setReview(review);

        self.phoneCallReviewDelegate.find(Utils.createSimpleObject(PhoneCallReview.COL_CALL_ID,callId,PhoneCallReview.COL_USER_ID,loggedInUserId))
            .then(
            function reviewExists(review:PhoneCallReview)
            {
                return q.resolve(review);
            },
            function reviewNotExists()
            {
                return self.phoneCallReviewDelegate.create(phoneCallReview);
            })
            .then( function(review:PhoneCallReview)
            {
                var query = {};
                query[ApiConstants.PHONE_CALL_ID] = callId;

                res.redirect(Utils.addQueryToUrl(Urls.reviewById(review.getId()), query));
            })
            .fail( function(error)
            {
                res.render('500',{error:error})
            })
    }

    private review(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.query[ApiConstants.PHONE_CALL_ID]);
        var reviewId:number = parseInt(req.params[ApiConstants.REVIEW_ID]);
        var loggedInUserId = req[ApiConstants.USER].id;
        var sessionData = new SessionData(req);

        q.all([
            self.phoneCallDelegate.get(callId, null, [PhoneCall.FK_PHONE_CALL_EXPERT, PhoneCall.FK_PHONE_CALL_CALLER]),
            self.phoneCallReviewDelegate.get(reviewId)
        ])
            .then(
            function callDetailsFetched(...args)
            {
                var call:PhoneCall = args[0][0];
                var review = args[0][1];
                var pageData = _.extend(sessionData.getData(), {
                    call: call,
                    review:review,
                    reviewId:reviewId
                });

                if (loggedInUserId == call.getExpertUserId())
                    res.render(CallFlowRoute.REVIEW_PAGE_FOR_EXPERT, pageData);
                else if (loggedInUserId == call.getCallerUserId())
                    res.render(CallFlowRoute.REVIEW_PAGE_FOR_CALLER, pageData);
            })
            .fail(
            function (error)
            {
                res.render('500',{error:error})
            })
    }
}

export = CallFlowRoute