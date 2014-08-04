import CouponApi                                        = require('./CouponApi');
import ExpertApi                                        = require('./ExpertApi');
import ScheduleRuleApi                                  = require('./ScheduleRuleApi');
import ScheduleExceptionApi                             = require('./ScheduleExceptionApi')
import IntegrationApi                                   = require('./IntegrationApi');
import IntegrationOwnerApi                              = require('./IntegrationOwnerApi');
import PaymentApi                                       = require('./PaymentApi')
import PayoutDetailApi                                  = require('./PayoutDetailApi');
import PhoneCallApi                                     = require('./PhoneCallApi');
import PricingSchemeApi                                 = require('./PricingSchemeApi');
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
import UserReviewApi                                    = require('./UserReviewApi');

function init(app)
{
    new CouponApi(app);
    new ExpertApi(app);
    new ScheduleRuleApi(app);
    new ScheduleExceptionApi(app);
    new IntegrationApi(app);
    new IntegrationOwnerApi(app);
    new PaymentApi(app);
    new PayoutDetailApi(app);
    new PricingSchemeApi(app);
    new PhoneCallApi(app);
    new ScheduledTaskApi(app);
    new UserPhoneApi(app);
    new TokenApi(app);
    new TransactionApi(app);
    new TwimlOutApi(app);
    new KookooApi(app);
    new ExotelApi(app);
    new UserApi(app);
    new UserProfileApi(app);
    new UserEducationApi(app);
    new UserEmploymentApi(app);
    new UserSkillApi(app);
    new WidgetApi(app);
    new ExpertiseApi(app);
    new UserReviewApi(app);
}
export = init