import CallFlowRoute                                        = require('./callFlow/CallFlowRoute');
import DashboardRoute                                       = require('./dashboard/DashboardRoute');
import MemberRegistrationRoute                              = require('./expertRegistration/MemberRegistrationRoute');
import PaymentRoute                                         = require('./payment/PaymentRoute');
import AuthenticationRoute                                  = require('./authentication/AuthenticationRoute');
import StaticRoute                                          = require('./static/StaticRoute');

function init(app)
{
    new CallFlowRoute(app);
    new PaymentRoute(app);
    new DashboardRoute(app);
    new MemberRegistrationRoute(app);
    new AuthenticationRoute(app);
    new StaticRoute(app);
}
export = init