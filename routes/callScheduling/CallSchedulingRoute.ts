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
import User                                                 = require('../../models/User');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IncludeFlag                                          = require('../../enums/IncludeFlag');
import MoneyUnit                                            = require('../../enums/MoneyUnit');
import TransactionStatus                                    = require('../../enums/TransactionStatus');

import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');
import CallFlowUrls                                         = require('../callFlow/Urls');
import DashboardUrls                                        = require('../../routes/dashboard/Urls');

class CallSchedulingRoute
{
    private static SCHEDULING:string = 'callScheduling/scheduling';

    private verificationCodeDelegate = new VerificationCodeDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();

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

        // 0. Check that selected start time hasn't already passed (expert reads the email too late)
        // 1. Validate the code and verify that selected slot is one of the original slots
        // 2. Fetch call details
        // 3. Fetch expert's phones
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
                    return [appointment.startTimes, call, self.userPhoneDelegate.search(Utils.createSimpleObject(UserPhone.USER_ID, call.getIntegrationMember().getUserId()))];
            })
            .spread(
            function expertPhonesFetched(startTimes:number[], call:PhoneCall, expertPhones:UserPhone[]):any
            {
                var pageData = {
                    call: call,
                    startTimes: startTimes,
                    phones: expertPhones
                };

                res.render(CallSchedulingRoute.SCHEDULING, pageData);
            })
            .fail(function (error)
            {
                res.render('500', {error: error});
            });
    }
}
export = CallSchedulingRoute