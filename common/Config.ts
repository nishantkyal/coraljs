///<reference path='../_references.d.ts'/>
import nconf        = require("nconf");

/*
 * Utility class for accessing global app config
 * Read from specified file
 */
class Config
{
    static ENV:string                                   = 'env';
    static VERSION:string                               = 'version';
    static SESSION_EXPIRY:string                        = 'session.expiry';

    static ENABLE_HTTP:string                           = 'enable.http';
    static ENABLE_HTTPS:string                          = 'enable.https';

    static SSL_KEY:string                               = 'ssl.key';
    static SSL_CERT:string                              = 'ssl.cert';

    static PROFILE_IMAGE_PATH:string                    = 'profile_image_path';
    static LOGO_PATH:string                             = 'logo_path';
    static TEMP_IMAGE_PATH:string                       = 'temp_image_path';
    static PROFILE_IMAGE_BASE_URL:string                = 'profile_image_base_url';

    static DATABASE_HOST:string                         = 'database.host';
    static DATABASE_NAME:string                         = 'database.name';
    static DATABASE_USER:string                         = 'database.user';
    static DATABASE_PASS:string                         = 'database.pass';
    static REF_DATABASE_NAME:string                     = 'ref.database.name';
    static DATABASE_SOCKET:string                       = 'database.socket';
    static REDIS_HOST:string                            = 'redis.host';
    static REDIS_PORT:string                            = 'redis.port';
    static EMAIL_TEMPLATE_BASE_DIR:string               = 'email_template_base_dir';
    static EMAIL_CDN_BASE_URI:string                    = 'email.cdn.base_uri';
    static WIDGET_TEMPLATE_BASE_DIR:string              = 'widget_template_base_dir';
    static WIDGET_CDN_BASE_URI:string                   = 'widget.cdn.base_uri';
    static DASHBOARD_URI:string                         = 'Dashboard.uri';
    static DASHBOARD_HTTP_PORT:string                   = 'Dashboard.httpPort';
    static DASHBOARD_HTTPS_PORT:string                  = 'Dashboard.httpsPort';
    static ACCESS_TOKEN_EXPIRY:string                   = 'access_token.expiry';
    static PASSWORD_SEED_LENGTH:string                  = 'password_seed.length';
    static PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS   = 'task.call_trigger.interval';                 // How often do we create scheduled tasks for triggering calls
    static CALL_REMINDER_LEAD_TIME_SECS:string          = 'call.reminder_notification.lead_time';       // Lead time for sending reminder for upcoming call
    static CALL_RETRY_DELAY_SECS:string                 = 'call.retry.delay';                           // Delay after which failed calls are retried
    static MINIMUM_DURATION_FOR_SUCCESS:string          = 'minimum.duration.for.success';
    static MAXIMUM_REATTEMPTS:string                    = 'maximum.reattempts';
    static MINIMUM_YEAR:string                          = 'minimum.year';

    static DEFAULT_NETWORK_ID:string                    = 'default_network_id';

    static TIMEZONE_REFRESH_INTERVAL_SECS:string        = 'timezone.refresh.interval';

    static CALLBACK_NUMBER:string                       = 'callback.number';
    static MAXIMUM_CALLBACK_DELAY:string                = 'maximum.callback.delay';
    static DELAY_AFTER_CALLBACK:string                  = 'delay.after.callback';

    static CALL_NETWORK_CHARGES_PER_MIN_DOLLAR:string   = 'call.network_charges_per_min.dollar';
    static CALL_TAX_PERCENT:string                      = 'call.tax.percent';
    static CALL_CANCELLATION_CHARGES_PERCENT:string     = 'call.cancellation_charges.percent';

    private static version:string;

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        nconf.file({file: "/var/searchntalk/config/config.json"});
    })();

    /* Getters */
    static get(key:string):any
    {
        if (key == Config.VERSION)
            return Config.version;

        return nconf.get(key);
    }

    static set(key:string, val:any)
    {
        if (key == Config.VERSION)
            Config.version = val;
    }
}
export = Config