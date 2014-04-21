///<reference path='../_references.d.ts'/>
import nconf        = require("nconf");

/*
 * Utility class for accessing global app config
 * Read from specified file
 */
class Config
{
    static ENV:string                                   = 'env';
    static SESSION_EXPIRY:string                        = 'session.expiry';

    static PROFILE_IMAGE_PATH:string                    = 'profile_image_path';
    static TEMP_IMAGE_PATH:string                       = 'temp_image_path';
    static PROFILE_IMAGE_BASE_URL:string                = 'profile_image_base_url';

    static DATABASE_HOST:string                         = 'database.host';
    static DATABASE_NAME:string                         = 'database.name';
    static DATABASE_USER:string                         = 'database.user';
    static DATABASE_PASS:string                         = 'database.pass';
    static DATABASE_SOCKET:string                       = 'database.socket';
    static REDIS_HOST:string                            = 'redis.host';
    static REDIS_PORT:string                            = 'redis.port';
    static EMAIL_TEMPLATE_BASE_DIR:string               = 'email_template_base_dir';
    static EMAIL_CDN_BASE_URI:string                    = 'email.cdn.base_uri';
    static WIDGET_TEMPLATE_BASE_DIR:string              = 'widget_template_base_dir';
    static WIDGET_PARTIALS_BASE_DIR:string              = 'widget_partial_base_dir';
    static DASHBOARD_URI:string                         = 'Dashboard.uri';
    static DASHBOARD_HTTP_PORT:string                   = 'Dashboard.httpPort';
    static DASHBOARD_HTTPS_PORT:string                  = 'Dashboard.httpsPort';
    static API_URI:string                               = 'Api.uri';
    static API_PORT:string                              = 'Api.port';
    static ACCESS_TOKEN_EXPIRY:string                   = 'access_token.expiry';
    static PASSWORD_RESET_EXPIRY:string                 = 'password_reset.expiry';
    static FB_APP_ID:string                             = 'fb.app_id';
    static FB_APP_SECRET:string                         = 'fb.app_secret';
    static LINKEDIN_API_KEY:string                      = 'linkedin.api_key';
    static LINKEDIN_API_SECRET:string                   = 'linkedin.api_secret';
    static TWILIO_ACCOUNT_SID:string                    = 'twilio.account_sid';
    static TWILIO_AUTH_TOKEN:string                     = 'twilio.auth_token';
    static TWILIO_NUMBER:string                         = 'twilio.number';
    static EXOTEL_SID:string                            = 'exotel.sid';
    static EXOTEL_TOKEN:string                          = 'exotel.token';
    static SMS_COUNTRY_URL:string                       = 'sms_country.url';
    static SMS_COUNTRY_USER:string                      = 'sms_country.user';
    static SMS_COUNTRY_PASSWORD:string                  = 'sms_country.password';
    static KOOKOO_NUMBER:string                         = 'kookoo.number';

    static PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS   = 'task.call_trigger.interval';                 // How often do we create scheduled tasks for triggering calls
    static CALL_REMINDER_LEAD_TIME_SECS:string          = 'call.reminder_notification.lead_time';       // Lead time for sending reminder for upcoming call
    static CALL_RETRY_DELAY_SECS:string                 = 'call.retry.delay';                           // Delay after which failed calls are retried


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