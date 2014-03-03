import EmailApi                         = require('./EmailApi');
import ExpertApi                        = require('./ExpertApi');
import ExpertScheduleRuleApi            = require('./ExpertScheduleRuleApi');
import ExpertScheduleExceptionApi       = require('./ExpertScheduleExceptionApi')
import IntegrationApi                   = require('./IntegrationApi');
import IntegrationOwnerApi              = require('./IntegrationOwnerApi');
import PaymentApi                       = require('./PaymentApi')
import PayoutDetailApi                  = require('./PayoutDetailApi');
import PhoneCallApi                     = require('./PhoneCallApi');
import PhoneNumberApi                   = require('./PhoneNumberApi');
import SMSApi                           = require('./SMSApi');
import TokenApi                         = require('./TokenApi');
import TransactionApi                   = require('./TransactionApi');
import TwimlApi                         = require('./TwimlApi');
import UserApi                          = require('./UserApi');
import UserProfileApi                   = require('./UserProfileApi');

function init(app)
{
    new EmailApi(app);
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
    new TokenApi(app);
    new TransactionApi(app);
    new TwimlApi(app);
    new UserApi(app);
    new UserProfileApi(app);
}

export = init