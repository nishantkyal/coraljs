import ICallingVendorDelegate           = require('../delegates/calling/ICallingVendorDelegate');
import TwilioDelegate                   = require('../delegates/calling/TwilioDelegate');

class CallProviderFactory
{
    getProvider():ICallingVendorDelegate
    {
        return new TwilioDelegate();
    }
}
export = CallProviderFactory