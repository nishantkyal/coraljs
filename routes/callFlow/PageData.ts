import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import User                                             = require('../../models/User');
import ExpertSchedule                                   = require('../../models/ExpertSchedule');
import Config                                           = require('../../common/Config');

import Middleware                                      = require('./Middleware');

class PageData
{
    expert:IntegrationMember;
    integration:Integration;
    logged_in_user:User;
    fb_app_id:number;
    startTimes:number[];
    duration:number;

    constructor(req)
    {
        this.logged_in_user = new User(req['user']);
        this.fb_app_id = Config.get(Config.FB_APP_ID);
        this.expert = Middleware.getSelectedExpert(req);
        this.startTimes = Middleware.getSelectedStartTimes(req);
        this.duration = Middleware.getDuration(req);
    }
}
export = PageData