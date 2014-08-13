///<reference path='_references.d.ts'/>
declare module 'Coral'
{
import q = require("q");
import log4js = require("log4js");
import redis = require("redis");

export enum CountryCode {
    AD = 376,
    AE = 971,
    AF = 93,
    AL = 355,
    AM = 374,
    AO = 244,
    AQ = 672,
    AR = 54,
    AT = 43,
    AU = 61,
    AW = 297,
    AZ = 994,
    BA = 387,
    BD = 880,
    BE = 32,
    BF = 226,
    BG = 359,
    BH = 973,
    BI = 257,
    BJ = 229,
    BL = 590,
    BN = 673,
    BO = 591,
    BR = 55,
    BT = 975,
    BW = 267,
    BY = 375,
    BZ = 501,
    CA = 1,
    CC = 61,
    CD = 243,
    CF = 236,
    CG = 242,
    CH = 41,
    CI = 225,
    CK = 682,
    CL = 56,
    CM = 237,
    CN = 86,
    CO = 57,
    CR = 506,
    CU = 53,
    CV = 238,
    CX = 61,
    CY = 357,
    CZ = 420,
    DE = 49,
    DJ = 253,
    DK = 45,
    DZ = 213,
    EC = 593,
    EE = 372,
    EG = 20,
    ER = 291,
    ES = 34,
    ET = 251,
    FI = 358,
    FJ = 679,
    FK = 500,
    FM = 691,
    FO = 298,
    FR = 33,
    GA = 241,
    GB = 44,
    GE = 995,
    GH = 233,
    GI = 350,
    GL = 299,
    GM = 220,
    GN = 224,
    GQ = 240,
    GR = 30,
    GT = 502,
    GW = 245,
    GY = 592,
    HK = 852,
    HN = 504,
    HR = 385,
    HT = 509,
    HU = 36,
    ID = 62,
    IE = 353,
    IL = 972,
    IM = 44,
    IN = 91,
    IQ = 964,
    IR = 98,
    IT = 39,
    JO = 962,
    JP = 81,
    KE = 254,
    KG = 996,
    KH = 855,
    KI = 686,
    KM = 269,
    KP = 850,
    KR = 82,
    KW = 965,
    KZ = 7,
    LA = 856,
    LB = 961,
    LI = 423,
    LK = 94,
    LR = 231,
    LS = 266,
    LT = 370,
    LU = 352,
    LV = 371,
    LY = 218,
    MA = 212,
    MC = 377,
    MD = 373,
    ME = 382,
    MG = 261,
    MH = 692,
    MK = 389,
    ML = 223,
    MM = 95,
    MN = 976,
    MO = 853,
    MR = 222,
    MT = 356,
    MU = 230,
    MV = 960,
    MW = 265,
    MX = 52,
    MY = 60,
    MZ = 258,
    NA = 264,
    NC = 687,
    NE = 227,
    NG = 234,
    NI = 505,
    NL = 31,
    NO = 47,
    NP = 977,
    NR = 674,
    NU = 683,
    NZ = 64,
    OM = 968,
    PA = 507,
    PE = 51,
    PF = 689,
    PG = 675,
    PH = 63,
    PK = 92,
    PL = 48,
    PM = 508,
    PN = 870,
    PR = 1,
    PT = 351,
    PW = 680,
    PY = 595,
    QA = 974,
    RO = 40,
    RS = 381,
    RU = 7,
    RW = 250,
    SA = 966,
    SB = 677,
    SC = 248,
    SD = 249,
    SE = 46,
    SG = 65,
    SH = 290,
    SI = 386,
    SK = 421,
    SL = 232,
    SM = 378,
    SN = 221,
    SO = 252,
    SR = 597,
    ST = 239,
    SV = 503,
    SY = 963,
    SZ = 268,
    TD = 235,
    TG = 228,
    TH = 66,
    TJ = 992,
    TK = 690,
    TL = 670,
    TM = 993,
    TN = 216,
    TO = 676,
    TR = 90,
    TV = 688,
    TW = 886,
    TZ = 255,
    UA = 380,
    UG = 256,
    US = 1,
    UY = 598,
    UZ = 998,
    VA = 39,
    VE = 58,
    VN = 84,
    VU = 678,
    WF = 681,
    WS = 685,
    YE = 967,
    YT = 262,
    ZA = 27,
    ZM = 260,
    ZW = 263,
}


export class CountryName {
    static CountryName: {
        AF: string;
        AL: string;
        DZ: string;
        AD: string;
        AO: string;
        AQ: string;
        AR: string;
        AM: string;
        AW: string;
        AU: string;
        AT: string;
        AZ: string;
        BH: string;
        BD: string;
        BY: string;
        BE: string;
        BZ: string;
        BJ: string;
        BT: string;
        BO: string;
        BA: string;
        BW: string;
        BR: string;
        BN: string;
        BG: string;
        BF: string;
        MM: string;
        BI: string;
        KH: string;
        CM: string;
        CA: string;
        CV: string;
        CF: string;
        TD: string;
        CL: string;
        CN: string;
        CX: string;
        CC: string;
        CO: string;
        KM: string;
        CG: string;
        CD: string;
        CK: string;
        CR: string;
        HR: string;
        CU: string;
        CY: string;
        CZ: string;
        DK: string;
        DJ: string;
        TL: string;
        EC: string;
        EG: string;
        SV: string;
        GQ: string;
        ER: string;
        EE: string;
        ET: string;
        FK: string;
        FO: string;
        FJ: string;
        FI: string;
        FR: string;
        PF: string;
        GA: string;
        GM: string;
        GE: string;
        DE: string;
        GH: string;
        GI: string;
        GR: string;
        GL: string;
        GT: string;
        GN: string;
        GW: string;
        GY: string;
        HT: string;
        HN: string;
        HK: string;
        HU: string;
        IN: string;
        ID: string;
        IR: string;
        IQ: string;
        IE: string;
        IM: string;
        IL: string;
        IT: string;
        CI: string;
        JP: string;
        JO: string;
        KZ: string;
        KE: string;
        KI: string;
        KW: string;
        KG: string;
        LA: string;
        LV: string;
        LB: string;
        LS: string;
        LR: string;
        LY: string;
        LI: string;
        LT: string;
        LU: string;
        MO: string;
        MK: string;
        MG: string;
        MW: string;
        MY: string;
        MV: string;
        ML: string;
        MT: string;
        MH: string;
        MR: string;
        MU: string;
        YT: string;
        MX: string;
        FM: string;
        MD: string;
        MC: string;
        MN: string;
        ME: string;
        MA: string;
        MZ: string;
        NA: string;
        NR: string;
        NP: string;
        NL: string;
        NC: string;
        NZ: string;
        NI: string;
        NE: string;
        NG: string;
        NU: string;
        KP: string;
        NO: string;
        OM: string;
        PK: string;
        PW: string;
        PA: string;
        PG: string;
        PY: string;
        PE: string;
        PH: string;
        PN: string;
        PL: string;
        PT: string;
        PR: string;
        QA: string;
        RO: string;
        RU: string;
        RW: string;
        BL: string;
        WS: string;
        SM: string;
        ST: string;
        SA: string;
        SN: string;
        RS: string;
        SC: string;
        SL: string;
        SG: string;
        SK: string;
        SI: string;
        SB: string;
        SO: string;
        ZA: string;
        KR: string;
        ES: string;
        LK: string;
        SH: string;
        PM: string;
        SD: string;
        SR: string;
        SZ: string;
        SE: string;
        CH: string;
        SY: string;
        TW: string;
        TJ: string;
        TZ: string;
        TH: string;
        TG: string;
        TK: string;
        TO: string;
        TN: string;
        TR: string;
        TM: string;
        TV: string;
        AE: string;
        UG: string;
        GB: string;
        UA: string;
        UY: string;
        US: string;
        UZ: string;
        VU: string;
        VA: string;
        VE: string;
        VN: string;
        WF: string;
        YE: string;
        ZM: string;
        ZW: string;
    };
}


export enum DayName {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    WEEKDAYS = 7,
    WEEKENDS = 8,
}


export enum ForeignKeyType {
    ONE_TO_ONE = 1,
    ONE_TO_MANY = 2,
    MANY_TO_MANY = 3,
    MANY_TO_ONE = 4,
}


export enum ImageSize {
    SMALL = 50,
    MEDIUM = 200,
    LARGE = 500,
}


export enum IndustryCode {
    DEFENSE_AND_SPACE = 1,
    COMPUTER_HARDWARE = 3,
    COMPUTER_SOFTWARE = 4,
    COMPUTER_NETWORKING = 5,
    INTERNET = 6,
    SEMICONDUCTORS = 7,
    TELECOMMUNICATIONS = 8,
    LAW_PRACTICE = 9,
    LEGAL_SERVICES = 10,
    MANAGEMENT_CONSULTING = 11,
    BIOTECHNOLOGY = 12,
    MEDICAL_PRACTICE = 13,
    HOSPITAL_AND_HEALTH_CARE = 14,
    PHARMACEUTICALS = 15,
    VETERINARY = 16,
    MEDICAL_DEVICES = 17,
    COSMETICS = 18,
    APPAREL_AND_FASHION = 19,
    SPORTING_GOODS = 20,
    TOBACCO = 21,
    SUPERMARKETS = 22,
    FOOD_PRODUCTION = 23,
    CONSUMER_ELECTRONICS = 24,
    CONSUMER_GOODS = 25,
    FURNITURE = 26,
    RETAIL = 27,
    ENTERTAINMENT = 28,
    GAMBLING_AND_CASINOS = 29,
    LEISURE_TRAVEL_AND_TOURISM = 30,
    HOSPITALITY = 31,
    RESTAURANTS = 32,
    SPORTS = 33,
    FOOD_AND_BEVERAGES = 34,
    MOTION_PICTURES_AND_FILM = 35,
    BROADCAST_MEDIA = 36,
    MUSEUMS_AND_INSTITUTIONS = 37,
    FINE_ART = 38,
    PERFORMING_ARTS = 39,
    RECREATIONAL_FACILITIES_AND_SERVICES = 40,
    BANKING = 41,
    INSURANCE = 42,
    FINANCIAL_SERVICES = 43,
    REAL_ESTATE = 44,
    INVESTMENT_BANKING = 45,
    INVESTMENT_MANAGEMENT = 46,
    ACCOUNTING = 47,
    CONSTRUCTION = 48,
    BUILDING_MATERIALS = 49,
    ARCHITECTURE_AND_PLANNING = 50,
    CIVIL_ENGINEERING = 51,
    AVIATION_AND_AEROSPACE = 52,
    AUTOMOTIVE = 53,
    CHEMICALS = 54,
    MACHINERY = 55,
    MINING_AND_METALS = 56,
    OIL_AND_ENERGY = 57,
    SHIPBUILDING = 58,
    UTILITIES = 59,
    TEXTILES = 60,
    PAPER_AND_FOREST_PRODUCTS = 61,
    RAILROAD_MANUFACTURE = 62,
    FARMING = 63,
    RANCHING = 64,
    DAIRY = 65,
    FISHERY = 66,
    PRIMARY_SECONDARY_EDUCATION = 67,
    HIGHER_EDUCATION = 68,
    EDUCATION_MANAGEMENT = 69,
    RESEARCH = 70,
    MILITARY = 71,
    LEGISLATIVE_OFFICE = 72,
    JUDICIARY = 73,
    INTERNATIONAL_AFFAIRS = 74,
    GOVERNMENT_ADMINISTRATION = 75,
    EXECUTIVE_OFFICE = 76,
    LAW_ENFORCEMENT = 77,
    PUBLIC_SAFETY = 78,
    PUBLIC_POLICY = 79,
    MARKETING_AND_ADVERTISING = 80,
    NEWSPAPERS = 81,
    PUBLISHING = 82,
    PRINTING = 83,
    INFORMATION_SERVICES = 84,
    LIBRARIES = 85,
    ENVIRONMENTAL_SERVICES = 86,
    PACKAGE_FREIGHT_DELIVERY = 87,
    INDIVIDUAL_AND_FAMILY_SERVICES = 88,
    RELIGIOUS_INSTITUTIONS = 89,
    CIVIC_AND_SOCIAL_ORGANIZATION = 90,
    CONSUMER_SERVICES = 91,
    TRANSPORTATION_TRUCKING_RAILROAD = 92,
    WAREHOUSING = 93,
    AIRLINES_AVIATION = 94,
    MARITIME = 95,
    INFORMATION_TECHNOLOGY_AND_SERVICES = 96,
    MARKET_RESEARCH = 97,
    PUBLIC_RELATIONS_AND_COMMUNICATIONS = 98,
    DESIGN = 99,
    NON_PROFIT_ORGANIZATION_MANAGEMENT = 100,
    FUND_RAISING = 101,
    PROGRAM_DEVELOPMENT = 102,
    WRITING_AND_EDITING = 103,
    STAFFING_AND_RECRUITING = 104,
    PROFESSIONAL_TRAINING_AND_COACHING = 105,
    VENTURE_CAPITAL_AND_PRIVATE_EQUITY = 106,
    POLITICAL_ORGANIZATION = 107,
    TRANSLATION_AND_LOCALIZATION = 108,
    COMPUTER_GAMES = 109,
    EVENTS_SERVICES = 110,
    ARTS_AND_CRAFTS = 111,
    ELECTRICAL_ELECTRONIC_MANUFACTURING = 112,
    ONLINE_MEDIA = 113,
    NANOTECHNOLOGY = 114,
    MUSIC = 115,
    LOGISTICS_AND_SUPPLY_CHAIN = 116,
    PLASTICS = 117,
    COMPUTER_AND_NETWORK_SECURITY = 118,
    WIRELESS = 119,
    ALTERNATIVE_DISPUTE_RESOLUTION = 120,
    SECURITY_AND_INVESTIGATIONS = 121,
    FACILITIES_SERVICES = 122,
    OUTSOURCING_OFFSHORING = 123,
    HEALTH_WELLNESS_AND_FITNESS = 124,
    ALTERNATIVE_MEDICINE = 125,
    MEDIA_PRODUCTION = 126,
    ANIMATION = 127,
    COMMERCIAL_REAL_ESTATE = 128,
    CAPITAL_MARKETS = 129,
    THINK_TANKS = 130,
    PHILANTHROPY = 131,
    E_LEARNING = 132,
    WHOLESALE = 133,
    IMPORT_AND_EXPORT = 134,
    MECHANICAL_OR_INDUSTRIAL_ENGINEERING = 135,
    PHOTOGRAPHY = 136,
    HUMAN_RESOURCES = 137,
    BUSINESS_SUPPLIES_AND_EQUIPMENT = 138,
    MENTAL_HEALTH_CARE = 139,
    GRAPHIC_DESIGN = 140,
    INTERNATIONAL_TRADE_AND_DEVELOPMENT = 141,
    WINE_AND_SPIRITS = 142,
    LUXURY_GOODS_AND_JEWELRY = 143,
    RENEWABLES_AND_ENVIRONMENT = 144,
    GLASS_CERAMICS_AND_CONCRETE = 145,
    PACKAGING_AND_CONTAINERS = 146,
    INDUSTRIAL_AUTOMATION = 147,
    GOVERNMENT_RELATIONS = 148,
}


export enum MoneyUnit {
    RUPEE = 1,
    DOLLAR = 2,
    PERCENT = 3,
    POINTS = 4,
}


export enum PhoneType {
    LANDLINE = 1,
    MOBILE = 2,
}


export enum SMSStatus {
    SCHEDULED = 1,
    FAILED = 2,
    RETRIED = 3,
}


export enum Salutation {
    "Mr." = 1,
    "Mrs." = 2,
    "Ms." = 3,
    "Dr." = 4,
    "Prof." = 5,
    "Gen." = 6,
    "St." = 7,
}


export enum ServiceRequestStatus {
}



export class AbstractModel {
    public __proto__: any;
    static TABLE_NAME: string;
    static DELEGATE: BaseDaoDelegate;
    private static FOREIGN_KEYS;
    private static _INITIALIZED;
    private logger;
    constructor(data?: Object);
    public toJson(): any;
    public toString(): string;
    public get(propertyName: string): any;
    public set(propertyName: string, val: any): void;
    private hasOne(fk);
    private hasMany(fk);
    static getForeignKeyForSrcKey(srcKey: string): ForeignKey;
}



export class BaseModel extends AbstractModel {
    static COL_ID: string;
    static COL_CREATED: string;
    static COL_UPDATED: string;
    static COL_DELETED: string;
    private id;
    private created;
    private updated;
    private deleted;
    static PUBLIC_FIELDS: string[];
    public getId(): number;
    public getCreated(): number;
    public getUpdated(): number;
    public getDeleted(): boolean;
    public setId(val: number): void;
    public setCreated(val: number): void;
    public setUpdated(val: number): void;
    public setDeleted(val: boolean): void;
    public isValid(): boolean;
}




export class ForeignKey {
    public type: ForeignKeyType;
    public src_key: string;
    public referenced_table: typeof BaseModel;
    public target_key: string;
    public local_property_to_set: string;
    constructor(type: ForeignKeyType, srcKey: string, referenced_table: typeof BaseModel, targetKey: string, localPropertyToSet?: string);
    public getSourcePropertyName(): string;
    public toString(): string;
}







export class AbstractDao {
    public modelClass: typeof BaseModel;
    public tableName: string;
    public logger: log4js.Logger;
    public mysqlDelegate: MysqlDelegate;
    constructor(modelClass: typeof BaseModel);
    /**
    * Persist model
    * Can persist one or more at one time if all models have same data to be inserted
    * @param data
    * @param transaction
    */
    public create(data: Object[], transaction?: Object): q.Promise<any>;
    public create(data: Object, transaction?: Object): q.Promise<any>;
    /**
    * Get one or more rows by id
    * @param id
    * @param fields
    */
    public get(id: number[], fields?: string[], transaction?: Object): q.Promise<any>;
    public get(id: number, fields?: string[], transaction?: Object): q.Promise<any>;
    /**
    * Search. Return all results
    * @param searchQuery
    * @param options
    * @param fields
    * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any>}
    */
    public search(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
    /**
    * Search. Return First result
    * @param searchQuery
    * @param fields
    * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any|null>}
    */
    public find(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
    /**
    * Update based on criteria or id
    * @param criteria
    * @param newValues
    * @param transaction
    */
    public update(criteria: number, newValues: Object, transaction?: Object): q.Promise<any>;
    public update(criteria: Object, newValues: Object, transaction?: Object): q.Promise<any>;
    /**
    * Delete by criteria or id
    * @param criteria
    * @param transaction
    */
    public delete(criteria: number, transaction?: Object): q.Promise<any>;
    public delete(criteria: Object, transaction?: Object): q.Promise<any>;
    /** Helper method to convert query objects to SQL fragments **/
    public generateWhereStatements(criteria: Object): {
        where: string[];
        values: any[];
    };
}




export class BaseMappingDao extends AbstractDao {
    public find(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
    public search(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
}







export class BaseDaoDelegate {
    public logger: log4js.Logger;
    public dao: AbstractDao;
    /** Can be constructed using just the model in case dao doesn't do anything special
    * e.g. Execute custom queries which AbstractDao doesn't support
    * @param dao
    */
    constructor(dao: typeof BaseModel);
    constructor(dao: AbstractDao);
    public get(id: any, fields?: string[], foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    public find(search: Object, fields?: string[], foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    public search(search: Object, fields?: string[], foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    public create(object: Object, transaction?: Object): q.Promise<any>;
    public create(object: Object[], transaction?: Object): q.Promise<any>;
    public update(criteria: Object, newValues: any, transaction?: Object): q.Promise<any>;
    public update(criteria: number, newValues: any, transaction?: Object): q.Promise<any>;
    public delete(criteria: number, softDelete?: boolean, transaction?: Object): q.Promise<any>;
    public delete(criteria: Object, softDelete?: boolean, transaction?: Object): q.Promise<any>;
}



export class FileWatcherDelegate {
    constructor(path: string, filters: RegExp[], initHandler?: (files: string[]) => void, createHandler?: (file: string, stat: string) => void, updateHandler?: (file: string, curr: string, prev: string) => void, deleteHandler?: (file: string, stat: string) => void);
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





export class ImageDelegate {
    public imageMagick: any;
    public resize(srcImagePath: string, outputPath: string, outputSize: ImageSize): q.Promise<any>;
    public delete(srcImagePath: string): q.Promise<any>;
    public move(oldPath: string, newPath: string): q.Promise<any>;
    public fetch(imageUrl: string, tempPath: string): q.Promise<any>;
}



export class LocalizationDelegate {
    private static ctor;
    static get(key: string, locale?: string): string;
    static setLocale(locale: string): void;
}



export class MysqlDelegate {
    private static pool;
    private logger;
    constructor(host?: string, database?: string, user?: string, password?: string, socketPath?: string);
    public createConnection(host?: string, user?: string, password?: string, socketPath?: string): q.Promise<any>;
    public getConnectionFromPool(): q.Promise<any>;
    public beginTransaction(transaction?: Object): q.Promise<any>;
    public executeQuery(query: string, parameters?: any[], connection?: any): q.Promise<any>;
    public executeInTransaction(thisArg: any, args?: IArguments): q.Promise<any>;
    public commit(transaction: any, result?: any): q.Promise<any>;
}



export class Config {
    static ENV: string;
    static VERSION: string;
    static SESSION_EXPIRY: string;
    static ENABLE_HTTP: string;
    static ENABLE_HTTPS: string;
    static SSL_KEY: string;
    static SSL_CERT: string;
    static PROFILE_IMAGE_PATH: string;
    static LOGO_PATH: string;
    static TEMP_IMAGE_PATH: string;
    static PROFILE_IMAGE_BASE_URL: string;
    static DATABASE_HOST: string;
    static DATABASE_NAME: string;
    static DATABASE_USER: string;
    static DATABASE_PASS: string;
    static REF_DATABASE_NAME: string;
    static DATABASE_SOCKET: string;
    static REDIS_HOST: string;
    static REDIS_SESSION_PORT: string;
    static REDIS_VERIFICATION_PORT: string;
    static REDIS_STATS_PORT: string;
    static EMAIL_TEMPLATE_BASE_DIR: string;
    static EMAIL_CDN_BASE_URI: string;
    static WIDGET_TEMPLATE_BASE_DIR: string;
    static WIDGET_CDN_BASE_URI: string;
    static DASHBOARD_URI: string;
    static DASHBOARD_HTTP_PORT: string;
    static DASHBOARD_HTTPS_PORT: string;
    static ACCESS_TOKEN_EXPIRY: string;
    static PASSWORD_SEED_LENGTH: string;
    static PROCESS_SCHEDULED_CALLS_TASK_INTERVAL_SECS: string;
    static CALL_REMINDER_LEAD_TIME_SECS: string;
    static CALL_RETRY_DELAY_SECS: string;
    static MINIMUM_DURATION_FOR_SUCCESS: string;
    static MAXIMUM_REATTEMPTS: string;
    static MINIMUM_YEAR: string;
    static CALL_REVIEW_EXPERT_QUESTION_COUNT: string;
    static CALL_REVIEW_USER_QUESTION_COUNT: string;
    static DEFAULT_NETWORK_ID: string;
    static TIMEZONE_REFRESH_INTERVAL_SECS: string;
    static CALLBACK_NUMBER: string;
    static MAXIMUM_CALLBACK_DELAY: string;
    static DELAY_AFTER_CALLBACK: string;
    static CALL_NETWORK_CHARGES_PER_MIN_DOLLAR: string;
    static CALL_TAX_PERCENT: string;
    static CALL_CANCELLATION_CHARGES_PERCENT: string;
    private static version;
    private static ctor;
    static get(key: string): any;
    static set(key: string, val: any): void;
}



export class Credentials {
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





export class Formatter {
    static formatMoney(val: number, moneyUnit: MoneyUnit): string;
    static formatName(firstName: string, lastName?: string, title?: Salutation): string;
    static formatDate(m: Date): string;
    static formatDate(m: string): string;
    static formatDate(m: number): string;
    static getNameInitials(firstName?: string, lastName?: string): string;
    static formatEmail(email: string, firstName?: string, lastName?: string, title?: Salutation): string;
    static formatTimezone(offset: any): string;
}



export class Utils {
    static getRandomString(length: number, characters?: string): string;
    static getRandomInt(min: any, max: any): any;
    static isNullOrEmpty(val: any): boolean;
    static getClassName(object: Object): string;
    static copyProperties(source: any, target: any): void;
    static camelToSnakeCase(camelCasedString: string): string;
    static snakeToCamelCase(snakeCasedString: string): string;
    static snakeCaseToNormalText(snakeCasedString: string): string;
    static enumToNormalText(enumObject: Object): {};
    static getObjectType(obj: any): string;
    static createSimpleObject(...args: any[]): Object;
    static repeatChar(char: string, times: number, delimiter?: string): string;
    static escapeHTML(s: string): string;
    static unescapeHTML(s: string): string;
    static addQueryToUrl(baseUrl: string, query: Object): string;
    static escapeObject(Obj: Object): Object;
    static escapeObject(Obj: Object[]): Object[];
    static unEscapeObject(obj: Object): Object;
    static unEscapeObject(obj: Object[]): Object[];
    static setLongerTimeout(func: Function, interval: number, ...args: any[]): number;
    static generateUrl(urlPattern: string, values?: Object, baseUrl?: string): string;
}





export class CacheHelper {
    private connection;
    constructor(port: number);
    public getConnection(): redis.RedisClient;
    public set(key: any, value: any, expiry?: number, overwrite?: boolean): q.Promise<any>;
    public get(key: any): q.Promise<any>;
    public del(key: any): q.Promise<any>;
    public createHash(set: any, values: any, keyFieldName: any, expiry: any): q.Promise<any>;
    public addToHash(set: any, key: any, value: any): q.Promise<any>;
    public getHashValues(set: any): q.Promise<any>;
    public getHashKeys(set: any): q.Promise<any>;
    public getHash(set: string): q.Promise<any>;
    public getFromHash(set: any, key: any): q.Promise<any>;
    public delFromHash(set: any, key: any): q.Promise<any>;
    public addToOrderedSet(set: any, key: any, value: any): q.Promise<any>;
    public addMultipleToOrderedSet(set: any, values: any, keyFieldName: any): q.Promise<any>;
    public getOrderedSet(set: any): q.Promise<any>;
    public getFromOrderedSet(set: any, key: any): q.Promise<any>;
    public delFromOrderedSet(set: any, key: any): q.Promise<any>;
    public setExpiry(key: any, expiry: any): q.Promise<any>;
    public incrementCounter(counterName: string): q.Promise<any>;
}

}