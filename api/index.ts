import CouponApi                                        = require('./CouponApi');
import ExpertApi                                        = require('./ExpertApi');
import ExpertScheduleRuleApi                            = require('./ExpertScheduleRuleApi');
import ExpertScheduleExceptionApi                       = require('./ExpertScheduleExceptionApi')
import IntegrationApi                                   = require('./IntegrationApi');
import IntegrationOwnerApi                              = require('./IntegrationOwnerApi');
import PaymentApi                                       = require('./PaymentApi')
import PayoutDetailApi                                  = require('./PayoutDetailApi');
import PhoneCallApi                                     = require('./PhoneCallApi');
import UserPhoneApi                                     = require('./UserPhoneApi');
import TokenApi                                         = require('./TokenApi');
import TransactionApi                                   = require('./TransactionApi');
import TwimlApi                                         = require('./TwimlApi');
import TwimlOutApi                                      = require('./TwimlOutApi');
import ExotelApi                                        = require('./ExotelApi')
import UserApi                                          = require('./UserApi');
import UserProfileApi                                   = require('./UserProfileApi');
import UserEducationApi                                 = require('./UserEducationApi');
import UserEmploymentApi                                = require('./UserEmploymentApi');
import UserSkillApi                                     = require('./UserSkillApi');
import WidgetApi                                        = require('./WidgetApi');

function init(app, secureApp?)
{
    new CouponApi(app, secureApp);
    new ExpertApi(app, secureApp);
    new ExpertScheduleRuleApi(app, secureApp);
    new ExpertScheduleExceptionApi(app, secureApp);
    new IntegrationApi(app, secureApp);
    new IntegrationOwnerApi(app, secureApp);
    new PaymentApi(app, secureApp);
    new PayoutDetailApi(app, secureApp);
    new PhoneCallApi(app, secureApp);
    new UserPhoneApi(app, secureApp);
    new TokenApi(app, secureApp);
    new TransactionApi(app, secureApp);
    new TwimlOutApi(app, secureApp);
    new TwimlApi(app, secureApp);
    new ExotelApi(app, secureApp);
    new UserApi(app, secureApp);
    new UserProfileApi(app, secureApp);
    new UserEducationApi(app, secureApp);
    new UserEmploymentApi(app, secureApp);
    new UserSkillApi(app, secureApp);
    new WidgetApi(app, secureApp);
}
export = init