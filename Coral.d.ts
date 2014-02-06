declare module "Coral"
{
export class ApiUrlDelegate {
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
    static getRejectedPromise(errorMessage: string): q.Promise<any>;
    static isNullOrEmpty(str: any): boolean;
    static getClassName(object: Object): string;
    static copyProperties(source: any, target: any): void;
    static camelToUnderscore(camelCasedString: string): string;
    static getObjectType(obj: any): string;
    static surroundWithQuotes(val: any): string;
    static createSimpleObject(key: string, value: any): Object;
}


export class ApiConstants {
    static FIELDS: string;
    static FILTERS: string;
    static INCLUDE: string;
    static ROLE: string;
    static USER_ID: string;
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



export class ExpertApi {
    constructor(app: any);
}



export class ExpertScheduleApi {
    constructor(app: any);
}



export class TwimlApi {
    private static ROOT;
    private static VERB_SAY;
    private static VERB_PLAY;
    private static VERB_DIAL;
    private static VERB_RECORD;
    private static VERB_GATHER;
    private static VERB_SMS;
    private static VERB_HANGUP;
    private static VERB_QUEUE;
    private static VERB_REDIRECT;
    private static VERB_PAUSE;
    private static VERB_REJECT;
    private static PARAM_DIGITS;
    constructor(app: any);
}




export class AccessTokenCache {
    public getAccessTokenDetails(token: string): q.Promise<any>;
    public addToken(integrationMember: IntegrationMember, expireAfter?: number): q.Promise<any>;
    public removeToken(token: string): q.Promise<any>;
}



export class CacheHelper {
    private static connection;
    private static getConnection();
    static set(key: any, value: any, expiry?: number): q.Promise<any>;
    static get(key: any): q.Promise<any>;
    static del(key: any): q.Promise<any>;
    static createHash(set: any, values: any, keyFieldName: any, expiry: any): q.Promise<any>;
    static addToHash(set: any, key: any, value: any): q.Promise<any>;
    static getHashValues(set: any): q.Promise<any>;
    static getHashKeys(set: any): q.Promise<any>;
    static getFromHash(set: any, key: any): q.Promise<any>;
    static delFromHash(set: any, key: any): q.Promise<any>;
    static addToOrderedSet(set: any, key: any, value: any): q.Promise<any>;
    static addMultipleToOrderedSet(set: any, values: any, keyFieldName: any): q.Promise<any>;
    static getOrderedSet(set: any): q.Promise<any>;
    static getFromOrderedSet(set: any, key: any): q.Promise<any>;
    static delFromOrderedSet(set: any, key: any): q.Promise<any>;
    static setExpiry(key: any, expiry: any): q.Promise<any>;
}



export class UnscheduledCallsCache {
    private KEY;
    public getUnscheduledCalls(expertId: number, scheduleId: number): q.Promise<any>;
    public addUnscheduledCall(expertId: number, scheduleId: number, call: PhoneCall): q.Promise<any>;
}


export class VerificationCodeCache {
    public createMobileVerificationCode(): q.Promise<any>;
    public searchMobileVerificationCode(code: string, ref: string): q.Promise<any>;
}



export class Config {
    private static ctor;
    static get(key: string): any;
}



export class Utils {
    static getRandomString(length: number, characters?: string): string;
    static getRandomInt(min: any, max: any): any;
    static getRejectedPromise(errorMessage: string): q.Promise<any>;
    static isNullOrEmpty(str: any): boolean;
    static getClassName(object: Object): string;
    static copyProperties(source: any, target: any): void;
    static camelToUnderscore(camelCasedString: string): string;
    static getObjectType(obj: any): string;
    static surroundWithQuotes(val: any): string;
    static createSimpleObject(key: string, value: any): Object;
}





export class BaseDAO implements IDao {
    public modelClass: any;
    public tableName: string;
    public logger: log4js.Logger;
    constructor();
    public create(data: any, transaction?: any): q.Promise<any>;
    public get(id: any, fields?: string[]): q.Promise<any>;
    public search(searchQuery: Object, options?: Object): q.Promise<any>;
    public update(criteria: Object, newValues: Object, transaction?: any): q.Promise<any>;
    public delete(id: string, softDelete?: boolean, transaction?: any): q.Promise<any>;
    public getModel(): typeof BaseModel;
}




export class EmailDao extends BaseDao {
    public getModel(): typeof BaseModel;
}
export class ExpertScheduleDao extends BaseDAO {
    public getModel(): typeof BaseModel;
    public findConflictingScheduleRules(startTime: number, endTime: number, integrationMemberId?: number): q.Promise<any>;
}
export class ExpertScheduleRuleDao extends BaseDao {
    public getModel(): typeof BaseModel;
}



interface IDao {
    create(data: any, transaction?: any): q.Promise<any>;
    get(id: String, fields?: string[]): q.Promise<any>;
    search(searchQuery: Object, options?: Object): q.Promise<any>;
    update(criteria: Object, newValues: Object, transaction?: any): q.Promise<any>;
    delete(id: string, softDelete: boolean, transaction?: any): q.Promise<any>;
    getModel(): typeof BaseModel;
}




export class IntegrationDao extends BaseDAO {
    static getAll(): q.Promise<any>;
    static getModel(): typeof BaseModel;
}




export class IntegrationMemberDao extends BaseDAO {
    public getModel(): typeof BaseModel;
}




export class PhoneCallDao extends BaseDAO {
    public getModel(): typeof BaseModel;
}




export class UserDao extends BaseDAO {
    public getModel(): typeof BaseModel;
}


export class ApiUrlDelegate {
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
    static twiml(): string;
    static twimlJoinConference(): string;
    static twimlCallExpert(callId?: number): string;
    static twimlCall(callId?: number): string;
    private static get(urlPattern, values?);
}





export class BaseDaoDelegate {
    public logger: log4js.Logger;
    constructor();
    public get(id: any, fields?: string[], includes?: string[]): q.Promise<any>;
    public getIncludeHandler(include: string, result: any): q.Promise<any>;
    public search(search: Object, options?: Object): q.Promise<any>;
    public create(object: Object, transaction?: any): q.Promise<any>;
    public update(criteria: Object, newValues: Object, transaction?: any): q.Promise<any>;
    public delete(id: string, transaction?: any): q.Promise<any>;
    public getDao(): IDao;
}





export class EmailDelegate {
    public getDao(): IDao;
    public send(): q.Promise<any>;
    public sendCallStatusUpdateNotifications(callerUserId: number, expertId: number, status: CallStatus): q.Promise<any>;
}







export class ExpertScheduleDelegate extends BaseDAODelegate {
    public getDao(): IDao;
    public getSchedulesForExpert(expertId: number, startTime?: number, endTime?: number): q.Promise<any>;
    public create(object: any, transaction?: any): q.Promise<any>;
    public createSchedulesForExpert(integrationMemberId: number, startTime: number, endTime: number): q.Promise<any>;
    public generateSchedules(rule: ExpertScheduleRule, integrationMemberId: number, startTime: number, endTime: number): ExpertSchedule[];
    public getIncludeHandler(include: string, result: Object): q.Promise<any>;
}




export class ExpertScheduleRuleDelegate extends BaseDaoDelegate {
    public getDao(): IDao;
    public getRulesByIntegrationMemberId(integrationMemberId: number): q.Promise<any>;
}



export class GlobalIDDelegate {
    static TIMESTAMP_SHIFT: number;
    static OBJECT_TYPE_SHIFT: number;
    static SHARD_SHIFT: number;
    static OBJECT_TYPE_MASK: number;
    static SHARD_MASK: number;
    static SEQUENCE_MASK: number;
    private static timestamp;
    private static sequence;
    private static types;
    public generate(type: string, shardId?: number): number;
}





export class IntegrationDelegate extends BaseDaoDelegate {
    public get(id: string, fields?: string[]): q.Promise<any>;
    public getAll(): q.Promise<any>;
    public getMultiple(ids: string[]): q.Promise<any>;
    public resetSecret(integrationId: string): q.Promise<any>;
    public getDao(): IDao;
}





export class IntegrationMemberDelegate extends BaseDaoDelegate {
    public create(object: Object, transaction?: any): q.Promise<any>;
    public get(id: any, fields?: string[], flags?: string[]): q.Promise<any>;
    public getIntegrationsForUser(user_id: string, fields?: string[]): q.Promise<any>;
    public findValidAccessToken(accessToken: string, integrationMemberId?: string): q.Promise<any>;
    public updateById(id: string, integrationMember: IntegrationMember): q.Promise<any>;
    public getDao(): IDao;
    public getIncludeHandler(include: string, result: any): q.Promise<any>;
}



export class MysqlDelegate {
    private static pool;
    private static ctor;
    static createConnection(): q.Promise<any>;
    static getConnectionFromPool(): q.Promise<any>;
    static beginTransaction(): q.Promise<any>;
    static executeQuery(query: string, parameters?: any[], connection?: any): q.Promise<any>;
    static commit(transaction: any, result?: any): q.Promise<any>;
}






export class PhoneCallDelegate extends BaseDAODelegate {
    static ALLOWED_NEXT_STATUS: {
        [s: number]: any[];
    };
    private unscheduledCallsCache;
    private static ctor;
    public callsByUser(user_id: string, filters: Object, fields?: string[]): q.Promise<any>;
    public callsToExpert(expert_id: string, filters: Object, fields?: string[]): q.Promise<any>;
    public create(object: any, transaction?: any): q.Promise<any>;
    public search(search: Object, options?: Object): q.Promise<any>;
    public update(criteria: Object, newValues: Object, transaction?: any): q.Promise<any>;
    public updateCallStatus(phoneCallId: number, newStatus: CallStatus): q.Promise<any>;
    public getIncludeHandler(include: string, result: PhoneCall): q.Promise<any>;
    public getDao(): IDao;
}





export class UserDelegate extends BaseDaoDelegate {
    public create(user?: Object, transaction?: any): q.Promise<any>;
    public authenticate(mobileOrEmail: string, password: string): q.Promise<any>;
    public update(id: string, user: Object): q.Promise<any>;
    public createMobileVerificationToken(): q.Promise<any>;
    public searchMobileVerificationToken(code: string, ref: string): q.Promise<any>;
    public getDao(): IDao;
}




export class UserSettingDelegate extends BaseDaoDelegate {
    public createPasswordResetToken(userId: string): q.Promise<any>;
    public createEmailVerificationToken(userId: string): q.Promise<any>;
    public getDao(): IDao;
}


interface ICallingVendorDelegate {
    sendSMS(to: string, body: string, from?: string): q.Promise<any>;
    makeCall(phone: string, url?: string): q.Promise<any>;
}




export class TwilioDelegate implements ICallingVendorDelegate {
    public sendSMS(to: string, body: string, from?: string): q.Promise<any>;
    public makeCall(phone: string, url?: string): q.Promise<any>;
}


export class ApiFlags {
    static INCLUDE_INTEGRATION: string;
    static INCLUDE_USER: string;
    static INCLUDE_INTEGRATION_MEMBER: string;
    static INCLUDE_INTEGRATION_MEMBER_USER: string;
    static INCLUDE_PROFILE: string;
    static INCLUDE_SCHEDULES: string;
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


export enum IntegrationMemberRole {
    OWNER = 1,
    ADMIN = 2,
    EXPERT = 3,
}


export enum MoneyUnit {
    RUPEE = 0,
    DOLLAR = 1,
    PERCENT = 2,
}


export enum UserSetting {
    PASSWORD_RESET_TOKEN = 0,
    PASSWORD_RESET_TOKEN_EXPIRY = 1,
    EMAIL_VERIFICATION_TOKEN = 2,
    EMAIL_VERIFICATION_TOKEN_EXPIRY = 3,
    MOBILE_VERIFICATION_TOKEN = 4,
    MOBILE_VERIFICATION_TOKEN_EXPIRY = 5,
}



export class AccessControl {
    private static logger;
    static allowOwner(req: any, res: any, next: Function): void;
    static allowAdmin(req: any, res: any, next: any): void;
    static allowExpert(req: any, res: any, next: any): void;
    static allowDashboard(req: any, res: any, next: any): void;
    private static isRequestFromDashboard(req);
    static getIntegration(accessToken: string, integrationMemberId?: string): q.Promise<any>;
}



export class BaseModel {
    static TABLE_NAME: string;
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
    public getData(): Object;
}



export class Email extends BaseModel {
    static TABLE_NAME: string;
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




export class ExpertScheduleRule extends BaseModel {
    static TABLE_NAME: string;
    public integration_member_id: number;
    public repeat_start: number;
    public repeat_interval: number;
    public repeat_cron: number;
    public repeat_end: number;
    public duration: number;
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
    private integration_id;
    private user_id;
    private role;
    private auth_code;
    private access_token;
    private access_token_expiry;
    private refresh_token;
    private refresh_token_expiry;
    public getIntegrationId(): number;
    public getUserId(): number;
    public getRole(): number;
    public getAuthCode(): string;
    public getAccessToken(): string;
    public getAccessTokenExpiry(): string;
    public getRefreshToken(): string;
    public getRefreshTokenExpiry(): string;
    public isValid(): boolean;
    public setIntegrationId(val: number): void;
    public setUserId(val: number): void;
    public setRole(val: number): void;
    public setAuthCode(val: string): void;
    public setAccessToken(val: string): void;
    public setAccessTokenExpiry(val: string): void;
    public setRefreshToken(val: string): void;
    public setRefreshTokenExpiry(val: string): void;
}



export class PhoneCall extends BaseModel {
    static TABLE_NAME: string;
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



export class User extends BaseModel {
    static TABLE_NAME: string;
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







declare function pluginFn(grunt: IGrunt): void;

}