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

import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');
import CallFlowUrls                                         = require('../callFlow/Urls');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');

class CallSchedulingRoute
{
    private static SCHEDULING:string = 'callScheduling/scheduling';
    private static RESCHEDULING:string = 'callScheduling/rescheduling';
    private static RESCHEDULING_BY_USER:string = 'callScheduling/reschedulingByUser';

    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private notificationDelegate = new NotificationDelegate();

    constructor(app, secureApp)
    {
        // Actual rendered pages
        app.get(Urls.scheduling(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.scheduling.bind(this));
        app.get(Urls.rescheduleByExpert(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.reschedulingByExpert.bind(this));
        app.get(Urls.rescheduleByUser(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.reschedulingByUser.bind(this));

        app.post(Urls.scheduling(), this.scheduled.bind(this));
        app.post(Urls.rescheduleByExpert(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.appointmentSelectedByExpert.bind(this));
        app.post(Urls.rescheduleByUser(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.appointmentSelectedByUser.bind(this));
        app.get(Urls.reject(), connect_ensure_login.ensureLoggedIn({setReturnTo: true, failureRedirect: DashboardUrls.login()}), this.reject.bind(this));
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
                if (!_.contains(appointment.startTimes, startTime.toString()))
                    throw 'Invalid request. Please click on one of the links in the email';
                else
                {
                    var callId:number = appointment.id;
                    return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER, IncludeFlag.INCLUDE_USER_PHONE, IncludeFlag.INCLUDE_EXPERT_PHONE]);
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
                    call: call,
                    startTime: startTime
                };
                res.render(CallSchedulingRoute.SCHEDULING, pageData);
            })
            .fail(function (error)
            {
                res.status(501);
            })
    }

    private scheduled(req:express.Request, res:express.Response)
    {
        var self = this;
        var startTime:number = parseInt(req.body[ApiConstants.START_TIME]);
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);

        self.phoneCallDelegate.update(callId, {status: CallStatus.SCHEDULED, start_time: startTime})
            .then(
            function callUpdated()
            {
                return self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER, IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function callFetched(call:PhoneCall)
            {
                if (startTime - moment().valueOf() < Config.get(Config.PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS) * 1000)
                {
                    self.phoneCallDelegate.scheduleCall(call);
                    self.notificationDelegate.scheduleCallNotification(call);
                }
                self.notificationDelegate.sendCallSchedulingCompleteNotifications(call, startTime);
            })
            .then(function scheduled(){
                res.send(200);
            })
            .fail(function (error)
            {
                res.send(501);
            })
    }

    private reschedulingByExpert(req:express.Request, res:express.Response)
    {
        var self = this;
        var appointmentCode:string = req.query[ApiConstants.CODE];

        this.verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode)
            .then(
            function appointmentDetailsFetched(appointment)
            {
                var callId:number = appointment.id;
                return self.phoneCallDelegate.get(callId);
            },
            function appointDetailsFetchFailed(error)
            {
                res.send(401, 'Invalid code');
            })
            .then(
            function callFetched(call:PhoneCall)
            {
                var pageData = {
                    call: call
                };
                res.render(CallSchedulingRoute.RESCHEDULING, pageData);
            })
            .fail(function (error)
            {
                res.status(501);
            })
    }

    private appointmentSelectedByExpert(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var startTime:number = parseInt(req.body[ApiConstants.START_TIME]);
        self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER])
            .then(
            function callFetched(call:PhoneCall)
            {
                self.notificationDelegate.sendCallReschedulingNotificationsToUser(call, startTime);
            })
            .fail(function (error)
            {
                res.status(501);
            })
    }

    private reschedulingByUser(req:express.Request, res:express.Response)
    {
        var self = this;
        var appointmentCode:string = req.query[ApiConstants.CODE];
        var expertId;
        var call:PhoneCall;
        var sessionData = new SessionData(req);

        this.verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode)
            .then(
            function appointmentDetailsFetched(appointment)
            {
                var callId:number = appointment.id;
                return self.phoneCallDelegate.get(callId);
            },
            function appointDetailsFetchFailed(error)
            {
                res.send(401, 'Invalid code');
            })
            .then(
            function callFetched(tempCall:PhoneCall)
            {
                expertId = tempCall.getIntegrationMemberId();
                call = tempCall;
                return self.integrationMemberDelegate.get(expertId, null, [IncludeFlag.INCLUDE_SCHEDULES, IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function handleExpertFound(expert)
            {
                sessionData.setExpert(expert);

                var pageData = _.extend(sessionData.getData(), {
                    messages: req.flash(),
                    call: call
                });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(CallSchedulingRoute.RESCHEDULING_BY_USER, pageData);
            },
            function handleExpertSearchFailed(error) { res.status(401).json('Error getting expert details for id: ' + expertId)});
    }

    private appointmentSelectedByUser(req:express.Request, res:express.Response)
    {
        var self = this;
        var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
        var startTime:number[] = [parseInt(req.body[ApiConstants.START_TIME])];

        self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_USER])
            .then(
            function callFetched(call:PhoneCall)
            {
                self.notificationDelegate.sendCallReschedulingNotificationsToExpert(call, startTime);
            })
            .fail(function (error)
            {
                res.status(501);
            })
    }

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
                self.notificationDelegate.sendCallAgendaFailedNotifications(call);
            })
            .fail(function (error)
            {
                res.status(501);
            })
    }

}
export = CallSchedulingRoute