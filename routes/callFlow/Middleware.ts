import ApiConstants                                         = require('../../enums/ApiConstants');
import Utils                                                = require('../../common/Utils');
import Urls                                                 = require('./Urls');

class Middleware
{
    private static SESSION_VARS_CALL_DETAILS:string = 'call_details';
    private static SESSION_VARS_EXPERT:string = 'call_expert';
    private static SESSION_VARS_SCHEDULE:string = 'call_schedule';

    static setCallDetails(req, call:any):void { req.session[Middleware.SESSION_VARS_CALL_DETAILS] = call; }
    static getCallDetails(req):any { return req.session[Middleware.SESSION_VARS_CALL_DETAILS]; }

    static setSelectedExpert(req, expert:any):void { req.session[Middleware.SESSION_VARS_EXPERT] = expert; }
    static getSelectedExpert(req):any{ return req.session[Middleware.SESSION_VARS_EXPERT]; }

    static setSelectedSchedule(req, schedule:any):void { req.session[Middleware.SESSION_VARS_SCHEDULE] = schedule; }
    static getSelectedSchedule(req):any { return req.session[Middleware.SESSION_VARS_SCHEDULE]; }
    
    static requireScheduleAndExpert(req, res, next)
    {
        var expert = this.getSelectedExpert(req);
        var selectedScheduleIds = this.getSelectedSchedule(req);
        var scheduleIds:string[] = [].concat(req.query[ApiConstants.SCHEDULE_ID]);

        if (!Utils.isNullOrEmpty(selectedScheduleIds) && !Utils.isNullOrEmpty(expert))
            next();
        else if (!Utils.isNullOrEmpty(scheduleIds) && !Utils.isNullOrEmpty(expert))
        {
            this.setSelectedSchedule(req, scheduleIds);
            next();
        }
        else if (!Utils.isNullOrEmpty(expert))
            res.redirect(Urls.callExpert(expert['id']));
        else
            res.send(400, "This is strange, how did you land up here without selecting an expert");
    }
}
export = Middleware