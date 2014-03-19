import CouponApi                        = require('./CouponApi');
import ExpertApi                        = require('./ExpertApi');
import ExpertScheduleRuleApi            = require('./ExpertScheduleRuleApi');
import ExpertScheduleExceptionApi       = require('./ExpertScheduleExceptionApi')
import IntegrationApi                   = require('./IntegrationApi');
import IntegrationOwnerApi              = require('./IntegrationOwnerApi');
import PaymentApi                       = require('./PaymentApi')
import PayoutDetailApi                  = require('./PayoutDetailApi');
import PhoneCallApi                     = require('./PhoneCallApi');
import PhoneNumberApi                   = require('./PhoneNumberApi');
import TokenApi                         = require('./TokenApi');
import UserPhoneApi                     = require('./UserPhoneApi');
import TransactionApi                   = require('./TransactionApi');
import TwimlApi                         = require('./TwimlApi');
import TwimlOutApi                      = require('./TwimlOutApi');
import ExotelApi                        = require('./ExotelApi')
import UserApi                          = require('./UserApi');
import UserProfileApi                   = require('./UserProfileApi');

function init(app)
{
    new CouponApi(app);
    new ExpertApi(app);
    new ExpertScheduleRuleApi(app);
    new ExpertScheduleExceptionApi(app);
    new IntegrationApi(app);
    new IntegrationOwnerApi(app);
    new PaymentApi(app);
    new PayoutDetailApi(app);
    new PhoneCallApi(app);
    new UserPhoneApi(app);
    new TokenApi(app);
    new TransactionApi(app);
    new TwimlOutApi(app);
    new TwimlApi(app);
    new ExotelApi(app);
    new UserApi(app);
    new UserProfileApi(app);
}

export = init