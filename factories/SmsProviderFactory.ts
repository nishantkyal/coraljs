import ICallingVendorDelegate           = require('../delegates/calling/ICallingVendorDelegate');
import TwilioDelegate                   = require('../delegates/calling/TwilioDelegate');


class SmsProviderFactory
{
    getProvider():ICallingVendorDelegate
    {
        return new TwilioDelegate();
    }

}
export = SmsProviderFactory