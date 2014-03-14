import ICallingVendorDelegate           = require('../delegates/calling/ICallingVendorDelegate');
import TwilioDelegate                   = require('../delegates/calling/TwilioDelegate');
import SMSCountryDelegate               = require('../delegates/calling/SMSCountryDelegate');


class SmsProviderFactory
{
    getProvider():ICallingVendorDelegate
    {
        //return new TwilioDelegate();
        return new SMSCountryDelegate();
    }

}
export = SmsProviderFactory