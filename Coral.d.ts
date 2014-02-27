declare module 'Coral'
{
export class ApiConstants {
    static FIELDS: string;
    static FILTERS: string;
    static INCLUDE: string;
    static ROLE: string;
    static USER_ID: string;
    static USER_PROFILE_ID: string;
    static EXPERT_ID: string;
    static INTEGRATION_ID: string;
    static PROFILE_TYPE: string;
    static USERNAME: string;
    static PASSWORD: string;
    static PHONE_NUMBER_ID: string;
    static PHONE_CALL_ID: string;
    static SCHEDULE_ID: string;
    static SCHEDULE_RULE_ID: string;
    static START_TIME: string;
    static END_TIME: string;
    static USER: string;
    static USER_PROFILE: string;
    static OAUTH: string;
    static INTEGRATION: string;
    static INTEGRATION_MEMBER: string;
    static EXPERT: string;
    static PHONE_NUMBER: string;
    static PHONE_CALL: string;
    static SCHEDULE: string;
    static SCHEDULE_RULE: string;
    static SMS: string;
}


export enum CallStatus {
    PLANNING = 0,
    SCHEDULED = 1,
    IN_PROGRESS = 2,
    COMPLETED = 3,
    CANCELLED = 4,
    POSTPONED = 5,
    FAILED = 6,
}


export enum ErrorCode {
    DUPLICATE = 0,
    DOESNT_EXIST = 1,
    INVALID_DATA = 2,
}


export class IncludeFlag {
    static INCLUDE_INTEGRATION: string;
    static INCLUDE_USER: string;
    static INCLUDE_USER_PROFILE: string;
    static INCLUDE_INTEGRATION_MEMBER: string;
    static INCLUDE_INTEGRATION_MEMBER_USER: string;
    static INCLUDE_SCHEDULES: string;
}


export enum IntegrationMemberRole {
    Owner = 1,
    Admin = 2,
    Expert = 3,
}


export enum MoneyUnit {
    RUPEE = 0,
    DOLLAR = 1,
    PERCENT = 2,
}


export enum Priority {
    HIGHEST = 0,
    HIGH = 1,
    NORMAL = 2,
    LOW = 3,
    LOWEST = 4,
}


export enum SMSStatus {
    SCHEDULED = 0,
    FAILED = 1,
    RETRIED = 2,
}



export class BaseModel {
    static TABLE_NAME: string;
    static ID: string;
    static CREATED: string;
    static UPDATED: string;
    static DELETED: string;
    private __proto__;
    private id;
    private created;
    private updated;
    private deleted;
    constructor(data?: Object);
    public getId(): number;
    public getCreated(): number;
    public getUpdated(): number;
    public getDeleted(): boolean;
    public setId(val: number): void;
    public setCreated(val: number): void;
    public setUpdated(val: number): void;
    public setDeleted(val: boolean): void;
    public toJson(): Object;
}



export class Email extends BaseModel {
    static TABLE_NAME: string;
    static RECIPIENT_EMAIL: string;
    static SENDER_EMAIL: string;
    static SUBJECT: string;
    static TEMPLATE: string;
    static DATA: string;
    static SCHEDULED_DATE: string;
    private recipient_email;
    private sender_email;
    private subject;
    private template;
    private data;
    private scheduled_date;
    public getRecipientEmail(): string;
    public getSenderEmail(): string;
    public getSubject(): string;
    public getTemplate(): string;
    public getEmailData(): Object;
    public getScheduledDate(): number;
    public setRecipientEmail(val: string): void;
    public setSenderEmail(val: string): void;
    public setSubject(val: string): void;
    public setTemplate(val: string): void;
    public setEmailData(val: Object): void;
    public setScheduledDate(val: number): void;
}




export class ExpertSchedule extends BaseModel {
    static TABLE_NAME: string;
    static SCHEDULE_RULE_ID: string;
    static INTEGRATION_MEMBER_ID: string;
    static START_TIME: string;
    static DURATION: string;
    static PRICE_UNIT: string;
    static PRICE_PER_MIN: string;
    static ACTIVE: string;
    private schedule_rule_id;
    private integration_member_id;
    private start_time;
    private duration;
    private price_unit;
    private price_per_min;
    private active;
    public getScheduleRuleId(): number;
    public getIntegrationMemberId(): number;
    public getStartTime(): number;
    public getDuration(): number;
    public getPriceUnit(): MoneyUnit;
    public getPricePerMin(): number;
    public getActive(): boolean;
    public setScheduleRuleId(val: number): void;
    public setIntegrationMemberId(val: number): void;
    public setStartTime(val: number): void;
    public setDuration(val: number): void;
    public setPriceUnit(val: MoneyUnit): void;
    public setPricePerMin(val: number): void;
    public setActive(val: boolean): void;
}




export class ExpertScheduleException extends BaseModel {
    static TABLE_NAME: string;
    public integration_member_id: number;
    public schedule_rule_id: number;
    public start_time: number;
    public duration: number;
    private price_unit;
    private price_per_min;
    public getIntegrationMemberId(): number;
    public getScheduleRuleId(): number;
    public getStartTime(): number;
    public getDuration(): number;
    public getPriceUnit(): MoneyUnit;
    public getPricePerMin(): number;
    public setIntegrationMemberId(val: number): void;
    public setScheduleRuleId(val: number): void;
    public setStartTime(val: number): void;
    public setDuration(val: number): void;
    public setPriceUnit(val: MoneyUnit): void;
    public setPricePerMin(val: number): void;
}




export class ExpertScheduleRule extends BaseModel {
    static TABLE_NAME: string;
    static INTEGRATION_MEMBER_ID: string;
    static REPEAT_START: string;
    static REPEAT_INTERVAL: string;
    static REPEAT_CRON: string;
    static REPEAT_END: string;
    static DURATION: string;
    static PRICE_UNIT: string;
    static PRICE_PER_MIN: string;
    private integration_member_id;
    private repeat_start;
    private repeat_interval;
    private repeat_cron;
    private repeat_end;
    private duration;
    private price_unit;
    private price_per_min;
    public getIntegrationMemberId(): number;
    public getRepeatStart(): number;
    public getRepeatInterval(): number;
    public getRepeatCron(): number;
    public getRepeatEnd(): number;
    public getDuration(): number;
    public getPriceUnit(): MoneyUnit;
    public getPricePerMin(): number;
    public setIntegrationMemberId(val: number): void;
    public setRepeatStart(val: number): void;
    public setRepeatInterval(val: number): void;
    public setRepeatCron(val: number): void;
    public setRepeatEnd(val: number): void;
    public setDuration(val: number): void;
    public setPriceUnit(val: MoneyUnit): void;
    public setPricePerMin(val: number): void;
    public isValid(): boolean;
}



export class Integration extends BaseModel {
    static TABLE_NAME: string;
    static TITLE: string;
    static WEBSITE_URL: string;
    static REDIRECT_URL: string;
    static INTEGRATION_TYPE: string;
    static SECRET: string;
    static STATUS: string;
    private title;
    private website_url;
    private redirect_url;
    private integration_type;
    private secret;
    private status;
    public getTitle(): string;
    public getWebsiteUrl(): string;
    public getRedirectUrl(): string;
    public getType(): string;
    public getSecret(): string;
    public getStatus(): string;
    public setTitle(val: string): void;
    public setWebsiteUrl(val: string): void;
    public setRedirectUrl(val: string): void;
    public setType(val: string): void;
    public setSecret(val: string): void;
    public setStatus(val: string): void;
}





export class IntegrationMember extends BaseModel {
    static TABLE_NAME: string;
    static INTEGRATION_ID: string;
    static USER_ID: string;
    static ROLE: string;
    static AUTH_CODE: string;
    static ACCESS_TOKEN: string;
    static ACCESS_TOKEN_EXPIRY: string;
    static REFRESH_TOKEN: string;
    static REFRESH_TOKEN_EXPIRY: string;
    private integration_id;
    private user_id;
    private role;
    private auth_code;
    private access_token;
    private access_token_expiry;
    private refresh_token;
    private refresh_token_expiry;
    private revenue_share;
    private revenue_share_unit;
    private integration;
    private user;
    public getIntegrationId(): number;
    public getUserId(): number;
    public getRole(): number;
    public getAuthCode(): string;
    public getAccessToken(): string;
    public getAccessTokenExpiry(): string;
    public getRefreshToken(): string;
    public getRefreshTokenExpiry(): string;
    public getIntegration(): Integration;
    public getUser(): User;
    public getRevenueShare(): number;
    public getRevenueShareUnit(): number;
    public isValid(): boolean;
    public setIntegrationId(val: number): void;
    public setUserId(val: number): void;
    public setRole(val: number): void;
    public setAuthCode(val: string): void;
    public setAccessToken(val: string): void;
    public setAccessTokenExpiry(val: string): void;
    public setRefreshToken(val: string): void;
    public setIntegration(val: Integration): void;
    public setUser(val: User): void;
    public setRefreshTokenExpiry(val: string): void;
    public setRevenueShare(val: any): void;
    public setRevenueShareUnit(val: any): void;
}



export class Payment extends BaseModel {
    static TABLE_NAME: string;
    static USER_ID: string;
    static AMOUNT: string;
    static UPDATE_DATE: string;
    static TRANSACTION_ID: string;
    static STATUS: string;
    private user_id;
    private amount;
    private update_date;
    private transaction_id;
    private status;
    public getUserId(): number;
    public getAmount(): number;
    public getUpdateDate(): number;
    public getTransactionId(): string;
    public getStatus(): number;
    public setUserId(val: number): void;
    public setAmount(val: number): void;
    public setUpdateDate(val: number): void;
    public setTransactionId(val: string): void;
    public setStatus(val: number): void;
}



export class PayoutDetail extends BaseModel {
    static TABLE_NAME: string;
    static USER_ID: string;
    static MODE: string;
    static ACCOUNT_HOLDER_NAME: string;
    static ACCOUNT_NUM: string;
    static IFSC_CODE: string;
    static BANK_NAME: string;
    private user_id;
    private mode;
    private account_holder_name;
    private account_num;
    private ifsc_code;
    private bank_name;
    public getUserId(): number;
    public getMode(): number;
    public getAccountHolderName(): string;
    public getAccountNum(): string;
    public getIfscCode(): string;
    public getBankName(): string;
    public setUserId(val: number): void;
    public setMode(val: number): void;
    public setAccountHolderName(val: string): void;
    public setAccountNum(val: string): void;
    public setIfscCode(val: string): void;
    public setBankName(val: string): void;
}



export class PhoneCall extends BaseModel {
    static TABLE_NAME: string;
    static CALLER_ID: string;
    static EXPERT_ID: string;
    static INTEGRATION_ID: string;
    static SCHEDULE_ID: string;
    static START_TIME: string;
    static DURATION: string;
    static STATUS: string;
    static PRICE: string;
    static PRICE_CURRENCY: string;
    static COST: string;
    static COST_CURRENCY: string;
    static AGENDA: string;
    static RECORDED: string;
    static EXTENSION: string;
    static NUM_RESCHEDULES: string;
    private caller_id;
    private expert_id;
    private integration_id;
    private schedule_id;
    private start_time;
    private duration;
    private status;
    private price;
    private price_currency;
    private cost;
    private cost_currency;
    private agenda;
    private recorded;
    private extension;
    private num_reschedules;
    public getCallerId(): number;
    public getExpertId(): number;
    public getIntegrationId(): number;
    public getScheduleId(): number;
    public getStartTime(): number;
    public getDuration(): number;
    public getStatus(): number;
    public getPrice(): number;
    public getPriceCurrency(): number;
    public getCost(): number;
    public getCostCurrency(): number;
    public getAgenda(): string;
    public getRecorded(): boolean;
    public getExtension(): string;
    public getNumReschedules(): number;
    public setCallerId(val: number): void;
    public setExpertId(val: number): void;
    public setIntegrationId(val: number): void;
    public setScheduleId(val: number): void;
    public setStartTime(val: number): void;
    public setDuration(val: number): void;
    public setStatus(val: number): void;
    public setPrice(val: number): void;
    public setPriceCurrency(val: number): void;
    public setCost(val: number): void;
    public setCostCurrency(val: number): void;
    public setAgenda(val: string): void;
    public setRecorded(val: boolean): void;
    public setExtension(val: string): void;
    public setNumReschedules(val: number): void;
    public isValid(): boolean;
}



export class PhoneNumber extends BaseModel {
    static TABLE_NAME: string;
    static USER_ID: string;
    static COUNTRY_CODE: string;
    static AREA_CODE: string;
    static PHONE: string;
    static TYPE: string;
    static VERIFIED: string;
    private user_id;
    private country_code;
    private area_code;
    private phone;
    private type;
    private verified;
    public getUserId(): number;
    public getCountryCode(): string;
    public getAreaCode(): string;
    public getPhone(): number;
    public getType(): number;
    public getVerified(): boolean;
    public isValid(): boolean;
    public setUserId(val: number): void;
    public setCountryCode(val: string): void;
    public setAreaCode(val: string): void;
    public setPhone(val: number): void;
    public setType(val: number): void;
    public setVerified(val: boolean): void;
}





export class SMS extends BaseModel {
    static TABLE_NAME: string;
    static COUNTRY_CODE: string;
    static PHONE: string;
    static SENDER: string;
    static MESSAGE: string;
    static SCHEDULED_DATE: string;
    static STATUS: string;
    static NUM_RETRIES: string;
    static PRIORITY: string;
    private country_code;
    private phone;
    private sender;
    private message;
    private scheduled_date;
    private status;
    private num_retries;
    private priority;
    constructor(data?: Object);
    public getCountryCode(): string;
    public getPhone(): number;
    public getSender(): string;
    public getMessage(): string;
    public getScheduledDate(): number;
    public getStatus(): number;
    public getNumRetries(): number;
    public getPriority(): Priority;
    public setCountryCode(val: string): void;
    public setPhone(val: number): void;
    public setSender(val: string): void;
    public setMessage(val: string): void;
    public setScheduledDate(val: number): void;
    public setStatus(val: number): void;
    public setNumRetries(val: number): void;
    public setPriority(val: Priority): void;
    public isValid(): boolean;
}



export class Transaction extends BaseModel {
    static TABLE_NAME: string;
    static USER_ID: string;
    static TOTAL: string;
    static TOTAL_UNIT: string;
    static STATUS: string;
    private user_id;
    private total;
    private total_unit;
    private status;
    public getUserId(): number;
    public getTotal(): number;
    public getTotalUnit(): number;
    public getStatus(): number;
    public setUserId(val: number): void;
    public setTotal(val: number): void;
    public setTotalUnit(val: number): void;
    public setStatus(val: number): void;
}



export class TransactionLine extends BaseModel {
    static TABLE_NAME: string;
    static TRANSACTION_ID: string;
    static PRODUCT_ID: string;
    static PRODUCT_TYPE: string;
    static TRANSACTION_TYPE: string;
    static AMOUNT: string;
    static AMOUNT_UNIT: string;
    private transaction_id;
    private product_id;
    private product_type;
    private transaction_type;
    private amount;
    private amount_unit;
    public getTransactionId(): number;
    public getProductId(): number;
    public getProductType(): number;
    public getTransactionType(): number;
    public getAmount(): number;
    public getAmountUnit(): number;
    public setTransactionId(val: number): void;
    public setProductId(val: number): void;
    public setProductType(val: number): void;
    public setTransactionType(val: number): void;
    public setAmount(val: number): void;
    public setAmountUnit(val: number): void;
}



export class User extends BaseModel {
    static TABLE_NAME: string;
    static FIRST_NAME: string;
    static LAST_NAME: string;
    static MOBILE: string;
    static EMAIL: string;
    static PASSWORD: string;
    static VERIFIED: string;
    static ACTIVATED: string;
    private first_name;
    private last_name;
    private mobile;
    private email;
    private password;
    private verified;
    private activated;
    public getFirstName(): string;
    public getLastName(): string;
    public getMobile(): string;
    public getEmail(): string;
    public getPassword(): string;
    public getVerified(): boolean;
    public getActivated(): boolean;
    public isValid(): boolean;
    public setFirstName(val: string): void;
    public setLastName(val: string): void;
    public setMobile(val: string): void;
    public setEmail(val: string): void;
    public setPassword(val: string): void;
    public setVerified(val: boolean): void;
    public setActivated(val: boolean): void;
}



export class UserOauth extends BaseModel {
    static TABLE_NAME: string;
    static USER_ID: string;
    static PROVIDER_ID: string;
    static OAUTH_USER_ID: string;
    static ACCESS_TOKEN: string;
    static ACCESS_TOKEN_EXPIRY: string;
    static REFRESH_TOKEN: string;
    static REFRESH_TOKEN_EXPIRY: string;
    private user_id;
    private provider_id;
    private oauth_user_id;
    private access_token;
    private access_token_expiry;
    private refresh_token;
    private refresh_token_expiry;
    public getUserId(): string;
    public getProviderId(): string;
    public getOauthUserId(): string;
    public getAccessToken(): string;
    public getAccessTokenExpiry(): string;
    public getRefreshToken(): string;
    public getRefreshTokenExpiry(): string;
    public isValid(): string;
    public setUserId(val: any): void;
    public setProviderId(val: any): void;
    public setOauthUserId(val: any): void;
    public setAccessToken(val: any): void;
    public setAccessTokenExpiry(val: any): void;
    public setRefreshToken(val: any): void;
    public setRefreshTokenExpiry(val: any): void;
}




export class UserProfile extends BaseModel {
    static TABLE_NAME: string;
    static USER_ID: string;
    static LOCALE: string;
    static SHORT_DESC: string;
    static LONG_DESC: string;
    private user_id;
    private locale;
    private short_desc;
    private long_desc;
    public getUserId(): number;
    public getLocale(): string;
    public getShortDesc(): string;
    public getLongDesc(): string;
    public setUserId(val: number): void;
    public setLocale(val: string): void;
    public setShortDesc(val: string): void;
    public setLongDesc(val: string): void;
}



export class ApiUrlDelegate {
    static BASE_URL: string;
    static expert(): string;
    static expertById(expertId?: number): string;
    static expertActivitySummary(expertId?: number): string;
    static user(): string;
    static userAuthentication(): string;
    static userById(userId?: number): string;
    static userPasswordResetToken(userId?: number): string;
    static emailVerificationToken(userId?: number): string;
    static mobileVerificationToken(): string;
    static userIntegrationDetails(userId?: number, integrationId?: number): string;
    static userActivitySummary(userId?: number): string;
    static userTransactionBalance(userId?: number): string;
    static userOAuth(): string;
    static userOAuthToken(userId?: number, type?: string): string;
    static decision(): string;
    static token(): string;
    static schedule(): string;
    static scheduleById(scheduleId?: number): string;
    static scheduleByExpert(expertId?: number): string;
    static scheduleRule(): string;
    static scheduleRuleById(scheduleRuleId?: number): string;
    static scheduleRuleByExpert(expertId?: number): string;
    static integration(): string;
    static integrationById(integrationId?: number): string;
    static integrationSecretReset(integrationId?: number): string;
    static integrationMember(integrationId?: number): string;
    static integrationMemberById(integrationId?: number, memberId?: number): string;
    static ownerActivitySummary(integrationId?: number): string;
    static payment(): string;
    static paymentById(paymentId?: number): string;
    static payoutDetail(): string;
    static payoutDetailById(payoutDetailId?: number): string;
    static phoneCall(): string;
    static phoneCallById(callId?: number): string;
    static phoneCallReschedule(callId?: number): string;
    static phoneCallCancel(callId?: number): string;
    static phoneNumber(): string;
    static phoneNumberById(phoneNumberId?: number): string;
    static transaction(): string;
    static transactionById(transactionId?: number): string;
    static transactionItem(transactionId?: number): string;
    static transactionItemById(transactionId?: number, itemId?: number): string;
    static sms(): string;
    static expertInviteEmail(): string;
    static userProfile(): string;
    static userProfileById(profileId?: number): string;
    static twiml(): string;
    static twimlJoinConference(): string;
    static twimlCallExpert(callId?: number): string;
    static twimlCall(callId?: number): string;
    private static get(urlPattern, values?);
}



export class Config {
    private static ctor;
    static get(key: string): any;
}



export class Utils {
    static getRandomString(length: number, characters?: string): string;
    static getRandomInt(min: any, max: any): any;
    static isNullOrEmpty(val: any): boolean;
    static getClassName(object: Object): string;
    static copyProperties(source: any, target: any): void;
    static camelToUnderscore(camelCasedString: string): string;
    static getObjectType(obj: any): string;
    static surroundWithQuotes(val: any): string;
    static createSimpleObject(key: string, value: any): Object;
}

}