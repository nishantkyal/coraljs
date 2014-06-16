import CouponApi                                        = require('./CouponApi');
import ExpertApi                                        = require('./ExpertApi');
import ScheduleRuleApi                                  = require('./ScheduleRuleApi');
import ScheduleExceptionApi                             = require('./ScheduleExceptionApi')
import IntegrationApi                                   = require('./IntegrationApi');
import IntegrationOwnerApi                              = require('./IntegrationOwnerApi');
import PaymentApi                                       = require('./PaymentApi')
import PayoutDetailApi                                  = require('./PayoutDetailApi');
import PhoneCallApi                                     = require('./PhoneCallApi');
import ScheduledTaskApi                                 = require('./ScheduledTaskApi')
import UserPhoneApi                                     = require('./UserPhoneApi');
import TokenApi                                         = require('./TokenApi');
import TransactionApi                                   = require('./TransactionApi');
import TwimlOutApi                                      = require('./TwimlOutApi');
import ExotelApi                                        = require('./ExotelApi')
import KookooApi                                        = require('./KookooApi');
import UserApi                                          = require('./UserApi');
import UserProfileApi                                   = require('./UserProfileApi');
import UserEducationApi                                 = require('./UserEducationApi');
import UserEmploymentApi                                = require('./UserEmploymentApi');
import UserSkillApi                                     = require('./UserSkillApi');
import WidgetApi                                        = require('./WidgetApi');
import ExpertiseApi                                     = require('./ExpertiseApi');
import ReviewApi                                        = require('./ReviewApi');

function init(app, secureApp?)
{
    new CouponApi(app, secureApp);
    new ExpertApi(app, secureApp);
    new ScheduleRuleApi(app, secureApp);
    new ScheduleExceptionApi(app, secureApp);
    new IntegrationApi(app, secureApp);
    new IntegrationOwnerApi(app, secureApp);
    new PaymentApi(app, secureApp);
    new PayoutDetailApi(app, secureApp);
    new PhoneCallApi(app, secureApp);
    new ScheduledTaskApi(app,  secureApp);
    new UserPhoneApi(app, secureApp);
    new TokenApi(app, secureApp);
    new TransactionApi(app, secureApp);
    new TwimlOutApi(app, secureApp);
    new KookooApi(app,secureApp);
    new ExotelApi(app, secureApp);
    new UserApi(app, secureApp);
    new UserProfileApi(app, secureApp);
    new UserEducationApi(app, secureApp);
    new UserEmploymentApi(app, secureApp);
    new UserSkillApi(app, secureApp);
    new WidgetApi(app, secureApp);
    new ExpertiseApi(app, secureApp);
    new ReviewApi(app, secureApp);
}
export = init