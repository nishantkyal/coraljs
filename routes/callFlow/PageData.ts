import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import User                                             = require('../../models/User');
import ExpertSchedule                                   = require('../../models/ExpertSchedule');

class PageData
{
    expert:IntegrationMember;
    integration:Integration;
    logged_in_user:User;
    fb_app_id:number;
    schedules:ExpertSchedule[];
}
export = PageData