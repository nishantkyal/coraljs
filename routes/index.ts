import CallFlowRoute                                        = require('./callFlow/CallFlowRoute');
import DashboardRoute                                       = require('./dashboard/DashboardRoute');
import ExpertRegistrationRoute                              = require('./expertRegistration/ExpertRegistrationRoute');

function init(app, secureApp)
{
    new CallFlowRoute(app, secureApp);
    new DashboardRoute(app, secureApp);
    new ExpertRegistrationRoute(app, secureApp);
}
export = init