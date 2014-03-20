///<reference path='../_references.d.ts'/>
import nconf        = require("nconf");

/*
 * Utility class for accessing global app config
 * Read from specified file
 */
class Config
{
    static ENV:string                                  = 'env';
    static DATABASE_HOST:string                        = 'DATABASE_HOST';
    static DATABASE_NAME:string                        = 'database.name';
    static DATABASE_USER:string                        = 'database.user';
    static DATABASE_PASS:string                        = 'database.pass';
    static DATABASE_SOCKET:string                      = 'database.socket';
    static REDIS_HOST:string                           = 'redis.host';
    static REDIS_PORT:string                           = 'redis.port';
    static EMAIL_CDN_BASE_URI:string                   = 'email.cdn.base_uri';
    static CORAL_URI:string                            = 'Coral_uri';
    static CORAL_PORT:string                           = 'Coral.port';
    static ACCESS_TOKEN_EXPIRY:string                  = 'access_token.expiry';
    static PASSWORD_RESET_EXPIRY:string                = 'password_reset.expiry';
    static FB_APP_ID:string                            = 'fb.app_id';
    static FB_APP_SECRET:string                        = 'fb.app_secret';
    static LINKEDIN_API_KEY:string                     = 'linkedin.api_key';
    static LINKEDIN_API_SECRET:string                  = 'linkedin.api_secret';
    static TWILIO_ACCOUNT_SID:string                   = 'twilio.account_sid';
    static TWILIO_AUTH_TOKEN:string                    = 'twilio.auth_token';
    static TWILIO_NUMBER:string                        = 'twilio.number';
    static EXOTEL_SID:string                           = 'exotel.sid';
    static EXOTEL_TOKEN:string                         = 'exotel.token';
    static SMS_COUNTRY_USER:string                     = 'sms_country.user';
    static SMS_COUNTRY_PASSWORD:string                 = 'sms_country.password';

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        nconf.file({file: "/var/searchntalk/config/config.json"});
    })();

    /* Getters */
    static get(key:string):any
    {
        return nconf.get(key);
    }
}
export = Config