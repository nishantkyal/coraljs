import express                                              = require('express');
import _                                                    = require('underscore');
import ApiConstants                                         = require('../../enums/ApiConstants');
import Utils                                                = require('../../common/Utils');
import BaseModel                                            = require('../../models/BaseModel');
import Urls                                                 = require('./Urls');
import CallFlowSessionData                                  = require('../callFlow/SessionData');
import CallFlowUrls                                         = require('../callFlow/Urls');

class Middleware
{
    static requireCallerAndCallDetails(req, res, next)
    {
        var sessionData = new CallFlowSessionData(req);
        var user = sessionData.getUser();
        var countryCode:number = parseInt(req.body[ApiConstants.COUNTRY_CODE] || sessionData.getCountryCode());
        var callerPhone:string = req.body[ApiConstants.PHONE] || sessionData.getCallerPhone();
        var agenda:string = req.body[ApiConstants.AGENDA] || sessionData.getAgenda();
        var duration:number = parseInt(req.body[ApiConstants.DURATION]) || sessionData.getDuration();
        var appointments = req.body[ApiConstants.START_TIME] || sessionData.getAppointments();
        var isCallNow = req.body[ApiConstants.CALL_NOW] || sessionData.getCallNow();
        var userGmtOffset = parseInt(req.body[ApiConstants.USER_GMT_OFFSET]) || sessionData.getUserGmtOffset();

        if (!Utils.isNullOrEmpty(appointments) && Utils.getObjectType(appointments) == 'Array')
            appointments = _.map(appointments, function (time:any) { return parseInt(time); });

        sessionData.setCountryCode(countryCode);
        sessionData.setCallerPhone(callerPhone.toString());
        sessionData.setAgenda(agenda);
        sessionData.setDuration(duration);
        sessionData.setAppointments(appointments);
        sessionData.setCallNow(isCallNow);
        sessionData.setUserGmtOffset(userGmtOffset);

        if (!Utils.isNullOrEmpty(callerPhone)
            && !Utils.isNullOrEmpty(agenda) && !Utils.isNullOrEmpty(duration)
            && (!Utils.isNullOrEmpty(appointments) || isCallNow)
            && (!Utils.isNullOrEmpty(user) && user.isValid()))
        {
            next();
        }
        else if (!Utils.isNullOrEmpty(user) && user.isValid())
        {
            res.redirect(CallFlowUrls.callExpert(user.getId()));
        }
        else
        {
            res.render('500', {error: JSON.stringify("Session Expire")});
        }
    }

    static requireTransaction(req:express.Request, res:express.Response, next:Function)
    {
        var sessionData = new CallFlowSessionData(req);
        var user = sessionData.getUser();

        if (!Utils.isNullOrEmpty(sessionData.getTransaction()))
        {
            next();
        }
        else if (!Utils.isNullOrEmpty(user))
        {
            res.redirect(CallFlowUrls.callExpert(user.getId()));
        }
        else
        {
            res.send(400, "This is strange, how did you land up here without selecting an expert");
        }
    }

    static ensureNotCallingSelf(req:express.Request, res:express.Response, next:Function)
    {
        var sessionData = new CallFlowSessionData(req);

        // Check that we're not calling a schedule with self
        if (sessionData.getLoggedInUser() && sessionData.getLoggedInUser().getId() == sessionData.getUser().getId())
            res.render('500', {error: "You can't call yourself!"});
        else
            next();
    }

}
export = Middleware