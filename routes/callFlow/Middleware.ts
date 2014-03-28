///<reference path='../../_references.d.ts'/>
import ApiConstants                                         = require('../../enums/ApiConstants');
import Utils                                                = require('../../common/Utils');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import PhoneCall                                            = require('../../models/PhoneCall');
import BaseModel                                            = require('../../models/BaseModel');
import Urls                                                 = require('./Urls');

class Middleware
{
    private static SESSION_VARS_EXPERT:string = 'call_expert';
    private static SESSION_VARS_START_TIMES:string = 'call_start_times';
    private static SESSION_VARS_DURATION:string = 'call_durations';

    static setSelectedExpert(req, expert:any):void { req.session[Middleware.SESSION_VARS_EXPERT] = expert; }
    static getSelectedExpert(req):any { return req.session[Middleware.SESSION_VARS_EXPERT]; }

    static setSelectedStartTimes(req, startTimes:number[]):void { req.session[Middleware.SESSION_VARS_START_TIMES] = JSON.stringify(startTimes); }
    static getSelectedStartTimes(req):number[]
    {
        try {
            return JSON.parse(req.session[Middleware.SESSION_VARS_START_TIMES]);
        } catch (e) {
            return null;
        }
    }

    static setDuration(req, duration:number):void { req.session[Middleware.SESSION_VARS_DURATION] = duration; }
    static getDuration(req):number { return parseInt(req.session[Middleware.SESSION_VARS_DURATION]); }

    static requireExpertAndAppointments(req, res, next)
    {
        var expert = Middleware.getSelectedExpert(req);
        var startTimes = Middleware.getSelectedStartTimes(req) || req.body[ApiConstants.START_TIME];
        Middleware.setSelectedStartTimes(req, startTimes);
        var duration:number = Middleware.getDuration(req) || req.body[ApiConstants.DURATION];
        Middleware.setDuration(req, duration);

        // TODO: Validate that selected start times and durations fit expert's schedules

        if (!Utils.isNullOrEmpty(startTimes) && !Utils.isNullOrEmpty(expert) && !Utils.isNullOrEmpty(duration))
            next();
        else if (!Utils.isNullOrEmpty(expert))
            res.redirect(Urls.callExpert(expert[BaseModel.ID]));
        else
            res.send(400, "This is strange, how did you land up here without selecting an expert");
    }
}
export = Middleware