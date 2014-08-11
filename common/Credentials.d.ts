/// <reference path="../_references.d.ts" />
declare class Credentials {
    static FB_APP_ID: string;
    static FB_APP_SECRET: string;
    static LINKEDIN_API_KEY: string;
    static LINKEDIN_API_SECRET: string;
    static TWILIO_ACCOUNT_SID: string;
    static TWILIO_AUTH_TOKEN: string;
    static TWILIO_NUMBER: string;
    static TWILIO_URI: string;
    static EXOTEL_SID: string;
    static EXOTEL_TOKEN: string;
    static SMS_COUNTRY_URL: string;
    static SMS_COUNTRY_USER: string;
    static SMS_COUNTRY_PASSWORD: string;
    static KOOKOO_NUMBER: string;
    static PAY_ZIPPY_CHARGING_URI: string;
    static PAY_ZIPPY_MERCHANT_ID: string;
    static PAY_ZIPPY_MERCHANT_KEY_ID: string;
    static PAY_ZIPPY_SECRET_KEY: string;
    static GOOGLE_ANALYTICS_TRACKING_ID: string;
    private static ctor;
    static get(key: string): any;
}
export = Credentials;
