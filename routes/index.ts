import CallFlowRoute                                        = require('./callFlow/CallFlowRoute');
import DashboardRoute                                       = require('./dashboard/DashboardRoute');
import MemberRegistrationRoute                              = require('./expertRegistration/MemberRegistrationRoute');
import PaymentRoute                                         = require('./payment/PaymentRoute');
import AuthenticationRoute                                  = require('./authentication/AuthenticationRoute');
import StaticRoute                                          = require('./static/StaticRoute');

function init(app, secureApp?)
{
    new CallFlowRoute(app, secureApp);
    new PaymentRoute(app, secureApp);
    new DashboardRoute(app, secureApp);
    new MemberRegistrationRoute(app, secureApp);
    new AuthenticationRoute(app, secureApp);
    new StaticRoute(app, secureApp);
}
export = init