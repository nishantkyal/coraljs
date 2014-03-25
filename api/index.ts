import ExpertApi                        = require('./ExpertApi');
import ExpertScheduleRuleApi           = require('./ExpertScheduleRuleApi');
import ExpertScheduleExceptionApi       = require('./ExpertScheduleExceptionApi')
import IntegrationApi                   = require('./IntegrationApi');
import IntegrationOwnerApi              = require('./IntegrationOwnerApi');
import PaymentApi                       = require('./PaymentApi')
import PayoutDetailApi                  = require('./PayoutDetailApi');
import PhoneCallApi                     = require('./PhoneCallApi');
import PhoneNumberApi                   = require('./UserPhoneApi');
import SMSApi                           = require('./SMSApi');
import TransactionApi                   = require('./TransactionApi');
import TwimlApi                         = require('./TwimlApi');
import TwimlOutApi                      = require('./TwimlOutApi');
import ExotelApi                        = require('./ExotelApi')
import KookooApi                        = require('./KookooApi');
import UserApi                          = require('./UserApi');

function init(app)
{
    new ExpertApi(app);
    new ExpertScheduleRuleApi(app);
    new ExpertScheduleExceptionApi(app);
    new IntegrationApi(app);
    new IntegrationOwnerApi(app);
    new PaymentApi(app);
    new PayoutDetailApi(app);
    new PhoneCallApi(app);
    new PhoneNumberApi(app);
    new SMSApi(app);
    new TransactionApi(app);
    new TwimlOutApi(app);
    new TwimlApi(app);
    new KookooApi(app);
    new ExotelApi(app);
    new UserApi(app);
}

export = init