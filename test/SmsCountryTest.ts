import SmsCountryDelegate                               = require('../delegates/calling/SmsCountryDelegate');
import VerificationCodeDelegate                         = require('../delegates/VerificationCodeDelegate');
import PhoneNumber                                      = require('../models/PhoneNumber');
import CountryCode                                      = require('../enums/CountryCode');
export function sendSms()
{
    var verificationCodeDelegate = new VerificationCodeDelegate();
    var phoneNumber = new PhoneNumber();
    phoneNumber.setCountryCode(CountryCode.IN);
    phoneNumber.setPhone('9810723200')

    verificationCodeDelegate.createAndSendMobileVerificationCode(phoneNumber)
        .then(
            function smsSent(response) {

            },
            function smsSendFailed(error) {

            }
        );
}