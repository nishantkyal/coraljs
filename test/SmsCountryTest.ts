import SmsCountryProvider                               = require('../providers/SmsCountryProvider');
import VerificationCodeDelegate                         = require('../delegates/VerificationCodeDelegate');
import UserPhone                                        = require('../models/UserPhone');
import CountryCode                                      = require('../enums/CountryCode');
export function sendSms()
{
    var verificationCodeDelegate = new VerificationCodeDelegate();
    var UserPhone = new UserPhone();
    UserPhone.setCountryCode(CountryCode.IN);
    UserPhone.setPhone('9810723200')

    verificationCodeDelegate.createAndSendMobileVerificationCode(UserPhone)
        .then(
            function smsSent(response) {

            },
            function smsSendFailed(error) {

            }
        );
}