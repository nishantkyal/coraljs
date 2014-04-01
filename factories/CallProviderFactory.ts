import IPhoneCallProvider                       = require('../providers/IPhoneCallProvider');
import TwilioProvider                           = require('../providers/TwilioProvider');

class CallProviderFactory
{
    getProvider():IPhoneCallProvider
    {
        return new TwilioProvider();
    }
}
export = CallProviderFactory