import SmsCountryDelegate                               = require('../delegates/calling/SmsCountryDelegate');

export function sendSms()
{
    var smsCountryDelegate = new SmsCountryDelegate();
    smsCountryDelegate.sendSMS('+919810723200', 'Your verification code for expert registration is 9876')
        .then(
            function smsSent(response) {

            },
            function smsSendFailed(error) {

            }
        );
}