import CallFlowRoute                                        = require('./callFlow/CallFlowRoute');
import DashboardRoute                                       = require('./dashboard/DashboardRoute');
import MemberRegistrationRoute                              = require('./expertRegistration/MemberRegistrationRoute');
import PaymentRoute                                         = require('./payment/PaymentRoute');

function init(app, secureApp?)
{
    new CallFlowRoute(app, secureApp);
    new PaymentRoute(app, secureApp);
    new DashboardRoute(app, secureApp);
    new MemberRegistrationRoute(app, secureApp);
}
export = init