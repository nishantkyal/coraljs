///<reference path='../_references.d.ts'/>
import nconf        = require("nconf");

/*
 * Utility class for accessing global app Credentials
 * Read from specified file
 */
class Credentials
{
    static FB_APP_ID:string                             = 'fb.app_id';
    static FB_APP_SECRET:string                         = 'fb.app_secret';
    static LINKEDIN_API_KEY:string                      = 'linkedin.api_key';
    static LINKEDIN_API_SECRET:string                   = 'linkedin.api_secret';
    static TWILIO_ACCOUNT_SID:string                    = 'twilio.account_sid';
    static TWILIO_AUTH_TOKEN:string                     = 'twilio.auth_token';
    static TWILIO_NUMBER:string                         = 'twilio.number';
    static TWILIO_URI:string                            = 'twilio.uri';
    static EXOTEL_SID:string                            = 'exotel.sid';
    static EXOTEL_TOKEN:string                          = 'exotel.token';
    static SMS_COUNTRY_URL:string                       = 'sms_country.url';
    static SMS_COUNTRY_USER:string                      = 'sms_country.user';
    static SMS_COUNTRY_PASSWORD:string                  = 'sms_country.password';
    static KOOKOO_NUMBER:string                         = 'kookoo.number';
    static PAY_ZIPPY_CHARGING_URI:string                = "pay_zippy.charging.uri";
    static PAY_ZIPPY_MERCHANT_ID:string                 = "pay_zippy.merchant_id";
    static PAY_ZIPPY_MERCHANT_KEY_ID:string             = "pay_zippy.merchant_key_id";
    static PAY_ZIPPY_SECRET_KEY:string                  = "pay_zippy.secret_key";
    static GOOGLE_ANALYTICS_TRACKING_ID:string          = 'google_analytics.tracking_id';

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        nconf.file("credentials", {file: "/var/searchntalk/config/credentials.json"});
    })();

    /* Getters */
    static get(key:string):any
    {
        return nconf.get(key);
    }

}
export = Credentials