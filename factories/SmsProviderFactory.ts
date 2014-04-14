import ISmsProvider                                             = require('../providers/ISmsProvider');
import TwilioProvider                                           = require('../providers/TwilioProvider');
import SmsCountryProvider                                       = require('../providers/SmsCountryProvider');

class SmsProviderFactory
{
    getProvider():ISmsProvider
    {
        return new SmsCountryProvider();
    }

}
export = SmsProviderFactory