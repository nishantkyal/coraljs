import ExpertApi                        = require('./ExpertApi');
import ExpertScheduleApi                = require('./ExpertScheduleApi');
import ExpertScheduleRulesApi           = require('./ExpertScheduleRulesApi');
import IntegrationApi                   = require('./IntegrationApi');
import IntegrationOwnerApi              = require('./IntegrationOwnerApi');
import PaymentApi                       = require('./PaymentApi')
import PayoutDetailApi                  = require('./PayoutDetailApi');
import PhoneCallApi                     = require('./PhoneCallApi');
import PhoneNumberApi                   = require('./PhoneNumberApi');
import SMSApi                           = require('./SMSApi');
import TransactionApi                   = require('./TransactionApi');
import TwimlApi                         = require('./TwimlApi');
import UserApi                          = require('./UserApi');

function init(app)
{
    new ExpertApi(app);
    new ExpertScheduleApi(app);
    new ExpertScheduleRulesApi(app);
    new IntegrationApi(app);
    new IntegrationOwnerApi(app);
    new PaymentApi(app);
    new PayoutDetailApi(app);
    new PhoneCallApi(app);
    new PhoneNumberApi(app);
    new SMSApi(app);
    new TransactionApi(app);
    new TwimlApi(app);
    new UserApi(app);
}

export = init