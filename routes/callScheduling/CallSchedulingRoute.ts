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
import PhoneCallDelegate                                    = require('../../delegates/PhoneCallDelegate');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import TransactionDelegate                                  = require('../../delegates/TransactionDelegate');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import UserPhoneDelegate                                    = require('../../delegates/UserPhoneDelegate');
import NotificationDelegate                                 = require('../../delegates/NotificationDelegate');
import Utils                                                = require('../../common/Utils');
import Config                                               = require('../../common/Config');
import Formatter                                            = require('../../common/Formatter');
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

import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');
import CallFlowUrls                                         = require('../callFlow/Urls');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');

class   CallSchedulingRoute
{
    private static SCHEDULING:string = 'callScheduling/scheduling';
    private static SUGGEST_NEW_TIME:string = 'callScheduling/rescheduling';
    private static PICK_NEW_SLOTS:string = 'callScheduling/reschedulingByUser';

    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private notificationDelegate = new NotificationDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();

    constructor(app, secureApp)
    {
        // Actual rendered pages
        app.get(Urls.scheduling(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.scheduling.bind(this));
        app.get(Urls.suggestTimeSlot(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.suggestAlternateAppointment.bind(this));
        app.get(Urls.pickTimeSlot(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.chooseAnotherTimeSlot.bind(this));
        app.get(Urls.reject(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.reject.bind(this));

        app.post(Urls.suggestTimeSlot(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.sendSuggestedAppointmentToCaller.bind(this));
        app.post(Urls.pickTimeSlot(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.sendNewTimeSlotsToExpert.bind(this));
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

        // 0. Check that selected start time hasn't already passed (expert reads the email too late)
        // 1. Validate the code and verify that selected slot is one of the original slots
        // 2. Fetch call details
        // 3. Fetch expert's phones
        // 4. If expert has phones in his account, confirm the call with default/first phone number
        // 5. Else ask expert to verify a phone number on the page
        if (startTime < moment().valueOf())
        {
            res.render('500', {error: 'The selected start time(' + Formatter.formatDate(startTime) + ') has already passed. Please choose another slot from the suggested slots or suggest a new one'});
            return;
        }

        q.all([
            this.verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode),
            self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_INTEGRATION_MEMBER])
        ])
            .then(
            function callAndSchedulingDetailsFetched(...args)
            {
                var appointment = args[0][0];
                var call:PhoneCall = args[0][1];

                if (Utils.isNullOrEmpty(appointment) || !_.contains(appointment.startTimes, startTime))
                    throw 'Invalid request. Please click on one of the links in the email';
                else
                    return [call, self.userPhoneDelegate.find(Utils.createSimpleObject(UserPhone.USER_ID, call.getIntegrationMember().getUserId()))];
            })
            .spread(
            function expertPhonesFetched(call:PhoneCall, expertPhone:UserPhone):any
            {
                function renderPage()
                {
                    var pageData = {
                        call: call
                    };

                    res.render(CallSchedulingRoute.SCHEDULING, pageData);
                }

                // If phone specified, schedule the call
                // else just render page (which will display appropriate message)
                if (!Utils.isNullOrEmpty(expertPhone))
                    return self.phoneCallDelegate.update(call.getId(), {status: CallStatus.SCHEDULED, start_time: startTime, expert_phone_id: expertPhone.getId()})
                        .then(
                        function callUpdated()
                        {
                            return self.phoneCallDelegate.get(call.getId(), null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_EXPERT_PHONE]);
                        })
                        .then(
                        function callFetched(updatedCall:PhoneCall)
                        {
                            call = updatedCall;
                            var tasks = [self.notificationDelegate.sendCallSchedulingCompleteNotifications(updatedCall, startTime)];

                            if (startTime > moment().valueOf() && startTime < moment().valueOf() + Config.get(Config.PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS) * 1000)
                            {
                                tasks.push(self.phoneCallDelegate.scheduleCall(updatedCall));
                                tasks.push(self.notificationDelegate.scheduleCallNotification(updatedCall));
                            }
                            return q.all(tasks);
                        })
                        .then(
                        function deleteSchedulingCode()
                        {
                            return self.verificationCodeDelegate.deleteAppointmentAcceptCode(appointmentCode);
                        })
                        .then(renderPage);
                else
                    renderPage();
            })
            .fail(function (error)
            {
                res.render('500', {error: error});
            });
    }

    /**
     * Invoked when expert doesn't like any of the slots and wants to specify a new time
     */
    private suggestAlternateAppointment(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var appointmentCode:string = req.query[ApiConstants.CODE];

        self.phoneCallDelegate.get(callId)
            .then(
            function callFetched(call:PhoneCall)
            {
                var pageData = {
                    call: call,
                    code: appointmentCode
                };
                res.render(CallSchedulingRoute.SUGGEST_NEW_TIME, pageData);
            })
            .fail(function (error)
            {
                res.send(500, {error: JSON.stringify(error)});
            });
    }

    /**
     * Send the appointment slot suggested by expert to caller
     */
    private sendSuggestedAppointmentToCaller(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var startTime:number = parseInt(req.body[ApiConstants.START_TIME]);
        var appointmentCode:string = req.body[ApiConstants.CODE];

        self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER])
            .then(
            function callFetched(call:PhoneCall)
            {
                self.notificationDelegate.sendSuggestedAppointmentToCaller(call, startTime);
            })
            .then(
            function deleteSchedulingCode()
            {
                return self.verificationCodeDelegate.deleteAppointmentAcceptCode(appointmentCode);
            })
            .then(
            function sendResponse()
            {
                res.send(200, "We've intimated the caller of your preferences. We'll get back to you when we get a response.");
            })
            .fail(function (error)
            {
                res.status(501);
            });
    }

    /**
     * Invoked when caller doesn't like the appointment slot suggested by expert and wants to pick more slots
     */
    private chooseAnotherTimeSlot(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var sessionData = new SessionData(req);

        return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER])
            .then(
            function handleCallFetched(call:PhoneCall)
            {
                sessionData.setExpert(call.getIntegrationMember());

                var pageData = _.extend(sessionData.getData(),
                    {
                        messages: req.flash(),
                        call: call
                    });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(CallSchedulingRoute.PICK_NEW_SLOTS, pageData);
            })
            .fail(
            function handleError(error)
            {
                res.render('500', {error: JSON.stringify(error)});
            });
    }

    /**
     * Send new time slots to expert
     */
    private sendNewTimeSlotsToExpert(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var startTime:number[] = [parseInt(req.body[ApiConstants.START_TIME])];
        var appointmentCode:string = req.body[ApiConstants.CODE];

        self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER])
            .then(
            function callFetched(call:PhoneCall)
            {
                self.notificationDelegate.sendNewTimeSlotsToExpert(call, startTime);
            })
            .then(
            function deleteSchedulingCode()
            {
                return self.verificationCodeDelegate.deleteAppointmentAcceptCode(appointmentCode);
            })
            .then(
            function sendResponse()
            {
                res.send(200, "We've intimated the expert of your preferences. We'll get back to you when we get a response.");
            })
            .fail(function (error)
            {
                res.render('500', {error: JSON.stringify(error)});
            });
    }

    /**
     * Invoked when expert rejects the call
     */
    private reject(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);

        self.phoneCallDelegate.update(callId, {status: CallStatus.AGENDA_DECLINED})
            .then(
            function callUpdated()
            {
                return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function callFetched(call:PhoneCall)
            {
                return self.notificationDelegate.sendCallRejectedNotifications(call, 'agenda ');
            })
            .then(
            function notificationSent()
            {
                res.send(200);
            })
            .fail(function (error)
            {
                res.render('500', {error: JSON.stringify(error)});
            });
    }

}
export = CallSchedulingRoute