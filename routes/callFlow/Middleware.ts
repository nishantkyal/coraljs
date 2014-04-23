///<reference path='../../_references.d.ts'/>
import ApiConstants                                         = require('../../enums/ApiConstants');
import Utils                                                = require('../../common/Utils');
import BaseModel                                            = require('../../models/BaseModel');
import Urls                                                 = require('./Urls');
import SessionData                                          = require('./SessionData');

class Middleware
{
    static requireExpertAndAppointments(req, res, next)
    {
        var sessionData = new SessionData(req);

        var expert = sessionData.getExpert();

        var appointments = sessionData.getAppointments() || req.body[ApiConstants.START_TIME];
        sessionData.setAppointments(appointments);

        var duration:number = sessionData.getDuration() || req.body[ApiConstants.DURATION];
        sessionData.setDuration(duration);

        // TODO: Validate that selected start times and durations fit expert's schedules

        if (!Utils.isNullOrEmpty(appointments) && !Utils.isNullOrEmpty(expert) && !Utils.isNullOrEmpty(duration))
            next();
        else if (!Utils.isNullOrEmpty(expert))
            res.redirect(Urls.callExpert(expert.getId()));
        else
            res.composeAndSend(400, "This is strange, how did you land up here without selecting an expert");
    }

}
export = Middleware