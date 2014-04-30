import CallFlowRoute                                        = require('./callFlow/CallFlowRoute');
import CallSchedulingRoute                                  = require('./callScheduling/CallSchedulingRoute');
import DashboardRoute                                       = require('./dashboard/DashboardRoute');
import MemberRegistrationRoute                              = require('./expertRegistration/MemberRegistrationRoute');

function init(app, secureApp?)
{
    new CallFlowRoute(app, secureApp);
    new CallSchedulingRoute(app, secureApp);
    new DashboardRoute(app, secureApp);
    new MemberRegistrationRoute(app, secureApp);
}
export = init