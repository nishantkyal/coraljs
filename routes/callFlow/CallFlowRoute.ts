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
import UserProfileDelegate                                  = require('../../delegates/UserProfileDelegate');
import NotificationDelegate                                 = require('../../delegates/NotificationDelegate');
import UserDelegate                                         = require('../../delegates/UserDelegate');
import UserEducationDelegate                                = require('../../delegates/UserEducationDelegate');
import UserSkillDelegate                                    = require('../../delegates/UserSkillDelegate');
import UserEmploymentDelegate                               = require('../../delegates/UserEmploymentDelegate');
import ScheduleDelegate                                     = require('../../delegates/ScheduleDelegate');
import ScheduleExceptionDelegate                            = require('../../delegates/ScheduleExceptionDelegate');
import CouponDelegate                                       = require('../../delegates/CouponDelegate');
import PricingSchemeDelegate                                = require('../../delegates/PricingSchemeDelegate');
import TimezoneDelegate                                     = require('../../delegates/TimezoneDelegate');
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
import PricingScheme                                        = require('../../models/PricingScheme');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
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
    private static INDEX:string                             = 'callFlow/index';
    private static SCHEDULING_PAGE_FOR_EXPERT:string        = 'callFlow/schedulingPageForExpert';x
    private static SCHEDULING_PAGE_FOR_CALLER:string        = 'callFlow/schedulingPageForCaller';

    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userProfileDelegate = new UserProfileDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private userDelegate = new UserDelegate();
    private userEmploymentDelegate = new UserEmploymentDelegate();
    private userSkillDelegate = new UserSkillDelegate();
    private userEducationDelegate = new UserEducationDelegate();
    private scheduleExceptionDelegate = new ScheduleExceptionDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private timezoneDelegate = new TimezoneDelegate();

    constructor(app, secureApp)
    {
        app.get(Urls.callExpert(), this.index.bind(this));
        app.get(Urls.scheduling(), AuthenticationDelegate.checkLogin({setReturnTo: true}), this.scheduling.bind(this));
    }

    /* Render index with expert schedules */
    // Validate that the expert has completed his profile and account is active
    private index(req:express.Request, res:express.Response)
    {
        var self = this;
        var userId = parseInt(req.params[ApiConstants.USER_ID]);
        var sessionData = new SessionData(req);

        this.userDelegate.get(userId, null, [IncludeFlag.INCLUDE_SCHEDULES, IncludeFlag.INCLUDE_PRICING_SCHEMES,IncludeFlag.INCLUDE_SKILL])
            .then(
            function expertFetched(user:User):any
            {
                return [user, q.all([
                    self.userProfileDelegate.find(Utils.createSimpleObject(UserProfile.COL_USER_ID, user.getId())),
                    self.phoneCallDelegate.getScheduledCalls(user.getId()),
                    self.scheduleExceptionDelegate.search(Utils.createSimpleObject(ScheduleException.COL_USER_ID, user.getId()), [Schedule.COL_START_TIME, Schedule.COL_DURATION])
                ])];
            },
            function handleExpertSearchFailed(error)
            {
                self.logger.error('Error in getting expert details - ' +  error);
                throw('No such expert exists!');
            })
            .spread(
            function userProfileFetched(user:User, ...args):any
            {
                var userProfile:UserProfile = args[0][0];

                var exceptions = [];

                if(!Utils.isNullOrEmpty(args[0][1]))
                    exceptions = exceptions.concat(_.map(args[0][1], function(call:any){
                        return {duration:call.getDuration(), start_time:call.getStartTime()}
                    }));

                if(!Utils.isNullOrEmpty(args[0][2]))
                    exceptions = exceptions.concat( _.map(args[0][2], function(exception:any){
                        return {duration:exception.getDuration(), start_time:exception.getStartTime()}
                    }));

                sessionData.setUser(user);
                sessionData.setExpertGmtOffset(self.timezoneDelegate.get(user.getTimezone()).getGmtOffset()*1000);

                var pageData = _.extend(sessionData.getData(), {
                    userProfile: userProfile,
                    exception: exceptions,
                    messages: req.flash()
                });

                res.render(CallFlowRoute.INDEX, pageData);
            },
            function handleExpertSearchFailed(error)
            {
                res.render('500', {error: JSON.stringify(error)});
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
        if (startTime < moment().valueOf())
        {
            res.render('500', {error: 'The selected start time(' + Formatter.formatDate(startTime) + ') has already passed. Please choose another slot from the suggested slots or suggest a new one'});
            return;
        }

        q.all([
            self.verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode),
            self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_EXPERT_USER,IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_TRANSACTION_LINE])
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
                    case call.getExpertUserId():
                        if (!Utils.isNullOrEmpty(call.getExpertPhoneId()))
                            returnArray.push(self.userPhoneDelegate.get(call.getExpertPhoneId()));
                        else
                            returnArray.push(self.userPhoneDelegate.find(Utils.createSimpleObject(UserPhone.COL_USER_ID, call.getExpertUserId())));

                    // If viewer == caller
                    case call.getCallerUserId():
                        returnArray.push(self.userPhoneDelegate.get(call.getCallerPhoneId()));
                }

                return returnArray;
            })
            .spread(
            function expertPhonesFetched(startTimes:number[], call:PhoneCall, phone:UserPhone):any
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
                    expertGmtOffset: self.timezoneDelegate.get(call.getExpertUser().getTimezone()).getGmtOffset()*1000,
                    userGmtOffset: self.timezoneDelegate.get(call.getUser().getTimezone()).getGmtOffset()*1000
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
}

export = CallFlowRoute