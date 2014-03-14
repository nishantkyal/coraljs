import CallFlowRoute                                        = require('./callFlow/CallFlowRoute');
import DashboardRoute                                       = require('./dashboard/DashboardRoute');
import ExpertRegistrationRoute                              = require('./expertRegistration/ExpertRegistrationRoute');

function init(app)
{
    new CallFlowRoute(app);
    new DashboardRoute(app);
    new ExpertRegistrationRoute(app);
}
export = init