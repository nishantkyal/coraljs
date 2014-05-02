///<reference path='../../_references.d.ts'/>
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
        var callerName:string = req.query[ApiConstants.NAME] || sessionData.getCallerName();
        var callerPhone:string = req.query[ApiConstants.PHONE] || sessionData.getCallerName();
        var agenda:string = req.query[ApiConstants.AGENDA] || sessionData.getAgenda();
        var duration:number = req.query[ApiConstants.DURATION] || sessionData.getDuration();
        var appointments = req.query[ApiConstants.START_TIME] || sessionData.getAppointments();
        var isCallNow = req.query[ApiConstants.CALL_NOW];

        if (!Utils.isNullOrEmpty(appointments) && Utils.getObjectType(appointments) == 'Array')
            appointments = _.map(appointments, function(time:any) { return parseInt(time); });

        sessionData.setCallerName(callerName);
        sessionData.setCallerPhone(callerPhone);
        sessionData.setAgenda(agenda);
        sessionData.setDuration(duration);
        sessionData.setAppointments(appointments);

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
            res.composeAndSend(400, "This is strange, how did you land up here without selecting an expert");
        }
    }

}
export = Middleware