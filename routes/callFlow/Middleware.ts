import express                                              = require('express');
import _                                                    = require('underscore');
import ApiConstants                                         = require('../../enums/ApiConstants');
import Utils                                                = require('../../common/Utils');
import BaseModel                                            = require('../../models/BaseModel');
import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');

class Middleware
{
    static requireCallerAndCallDetails(req, res, next)
    {
        var sessionData = new SessionData(req);
        var expert = sessionData.getExpert();
        var callerName:string = req.body[ApiConstants.NAME] || sessionData.getCallerName();
        var callerPhone:string = req.body[ApiConstants.PHONE] || sessionData.getCallerName();
        var agenda:string = req.body[ApiConstants.AGENDA] || sessionData.getAgenda();
        var duration:number = req.body[ApiConstants.DURATION] || sessionData.getDuration();
        var appointments = req.body[ApiConstants.START_TIME] || sessionData.getAppointments();
        var isCallNow = req.body[ApiConstants.CALL_NOW] || sessionData.getCallNow();

        if (!Utils.isNullOrEmpty(appointments) && Utils.getObjectType(appointments) == 'Array')
            appointments = _.map(appointments, function(time:any) { return parseInt(time); });

        sessionData.setCallerName(callerName);
        sessionData.setCallerPhone(callerPhone);
        sessionData.setAgenda(agenda);
        sessionData.setDuration(duration);
        sessionData.setAppointments(appointments);
        sessionData.setCallNow(isCallNow);

        if (!Utils.isNullOrEmpty(callerName) && !Utils.isNullOrEmpty(callerPhone)
                && !Utils.isNullOrEmpty(agenda) && !Utils.isNullOrEmpty(duration)
                    && (!Utils.isNullOrEmpty(appointments) || isCallNow)
                        && !Utils.isNullOrEmpty(expert))
        {
            next();
        }
        else if (!Utils.isNullOrEmpty(expert))
        {
            res.redirect(Urls.callExpert(expert.getId()));
        }
        else
        {
            res.send(400, "This is strange, how did you land up here without selecting an expert");
        }
    }

    static requireTransaction(req:express.Request, res:express.Response, next:Function)
    {
        var sessionData = new SessionData(req);
        var expert = sessionData.getExpert();

        if (!Utils.isNullOrEmpty(sessionData.getTransaction()))
        {
            next();
        }
        else if (!Utils.isNullOrEmpty(expert))
        {
            res.redirect(Urls.callExpert(expert.getId()));
        }
        else
        {
            res.send(400, "This is strange, how did you land up here without selecting an expert");
        }
    }

}
export = Middleware