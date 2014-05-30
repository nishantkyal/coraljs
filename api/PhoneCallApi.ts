import _                                                    = require('underscore');
import express                                              = require('express');
import connect_ensure_login                                 = require('connect-ensure-login');
import ApiConstants                                         = require('../enums/ApiConstants');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import PhoneCallDelegate                                    = require('../delegates/PhoneCallDelegate');
import VerificationCodeDelegate                             = require('../delegates/VerificationCodeDelegate');
import AccessControl                                        = require('../middleware/AccessControl');
import RequestHandler                                       = require('../middleware/RequestHandler');
import PhoneCall                                            = require('../models/PhoneCall');
import User                                                 = require('../models/User');
import Utils                                                = require('../common/Utils');

/*
 * API calls for managing phone calls
 */
class PhoneCallApi
{
    constructor(app, secureApp)
    {
        var phoneCallDelegate = new PhoneCallDelegate();
        var verificationCodeDelegate = new VerificationCodeDelegate();

        app.put(ApiUrlDelegate.phoneCall(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var phoneCall:PhoneCall = req.body[ApiConstants.PHONE_CALL];

            phoneCallDelegate.create(phoneCall)
                .then(
                function callCreated(result) { res.send(result); },
                function callCreateError(error) { res.send(500); }
            )
        });

        app.post(ApiUrlDelegate.phoneCallById(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var phoneCallId:number = req.params[ApiConstants.PHONE_CALL_ID];
            var phoneCall:PhoneCall = req.body[ApiConstants.PHONE_CALL];

            phoneCallDelegate.update({id: phoneCallId}, phoneCall)
                .then(
                function callUpdated() { res.send(200); },
                function callUpdateError(error) { res.status(500); }
            )
        });

        app.post(ApiUrlDelegate.phoneCallScheduling(), function (req:express.Request, res:express.Response)
        {
            // 1. Update call status
            // 2. Send emails to both caller and expert
            // 3. Send SMS to both caller and expert
            var loggedInUser:User = new User(req[ApiConstants.USER]);
            var callId:number = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var appointmentCode:string = req.query[ApiConstants.CODE] || req.body[ApiConstants.CODE];

            var pickedTimeSlots = _.map([].concat(req.body[ApiConstants.START_TIME] || req.query[ApiConstants.START_TIME]), function(slot) { return parseInt(slot); });
            var reason:string = req.body[ApiConstants.REASON];

            if (pickedTimeSlots.length != 0 || !Utils.isNullOrEmpty(reason))
            {
                verificationCodeDelegate.verifyAppointmentAcceptCode(appointmentCode)
                    .then(
                    function callAndSchedulingDetailsFetched(appointment)
                    {
                        return phoneCallDelegate.processSchedulingRequest(callId, loggedInUser.getId(), appointment.startTimes, pickedTimeSlots, reason);
                    })
                    /*.then(
                    function callSchedulingDone()
                    {
                        return verificationCodeDelegate.deleteAppointmentAcceptCode(appointmentCode);
                    })*/
                    .then(
                    function appointmentCodeDeleted(response)
                    {
                        res.send(200, response.toString());
                    })
                    .fail(
                    function callSchedulingFailed(error)
                    {
                        res.send(500, JSON.stringify(error));
                    });
            }
            else
                res.send(400, 'Invalid request');
        });

        app.get(ApiUrlDelegate.phoneCallById(), connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var phoneCallId:number = req.params[ApiConstants.PHONE_CALL_ID];

            return phoneCallDelegate.get(phoneCallId)
                .then(
                function callFetched(call) { res.json(call); },
                function callFetchFailed(error) { res.status(400).send('No phone call found for id: ' + phoneCallId); }
            )
        });

        app.get(ApiUrlDelegate.phoneCall(), RequestHandler.requireFilters, connect_ensure_login.ensureLoggedIn(), function (req:express.Request, res:express.Response)
        {
            var filters = req.body[ApiConstants.FILTERS];

            phoneCallDelegate.search(filters)
                .then(
                function handleCallSearched(response) { res.json(response); },
                function handleCallSearchFailed(error) { res.status(500).json(error); }
            );
        });


    }
}
export = PhoneCallApi