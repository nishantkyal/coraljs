declare module 'coraljs'
{
import q = require("q");
import log4js = require("log4js");
import redis = require("redis");
import express = require("express");

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


export enum Salutation {
    "Mr." = 1,
    "Mrs." = 2,
    "Ms." = 3,
    "Dr." = 4,
    "Prof." = 5,
    "Gen." = 6,
    "St." = 7,
}






export class AbstractModel {
    __proto__: any;
    static TABLE_NAME: string;
    static DELEGATE: BaseDaoDelegate;
    private static FOREIGN_KEYS;
    private static FK_COLUMNS;
    logger: log4js.Logger;
    static PUBLIC_FIELDS: string[];
    constructor(data?: Object);
    toJson(): any;
    toString(): string;
    get(propertyName: string): any;
    set(propertyName: string, val: any): void;
    private hasOne(fk);
    private hasMany(fk);
    static getForeignKeyForSrcKey(srcKey: string): ForeignKey;
    static getForeignKeyForColumn(col: string): ForeignKey;
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
    getId(): number;
    getCreated(): number;
    getUpdated(): number;
    getDeleted(): boolean;
    setId(val: number): void;
    setCreated(val: number): void;
    setUpdated(val: number): void;
    setDeleted(val: boolean): void;
    isValid(): boolean;
}




export class BaseS3Model extends AbstractModel {
    static COL_FILE_NAME: string;
    static METADATA_FIELDS: string[];
    private file_name;
    getFileName(): string;
    getBasePath(): void;
    setFileName(val: any): void;
    getS3Key(): string;
    setS3Key(val: any): void;
}





export class ForeignKey {
    type: ForeignKeyType;
    src_key: string;
    referenced_table: typeof AbstractModel;
    target_key: string;
    private local_property_to_set;
    constructor(type: ForeignKeyType, srcKey: string, referenced_table: typeof AbstractModel, targetKey: string, localPropertyToSet?: string);
    getSourcePropertyName(): string;
    toString(): string;
}






export class BaseMappingDao extends MysqlDao {
    search(searchQuery: Object, options: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
}






interface IDao {
    modelClass: typeof AbstractModel;
    create(data: Object[], transaction?: Object): q.Promise<any>;
    create(data: Object, transaction?: Object): q.Promise<any>;
    get(id: number[], options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    get(id: number, options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    search(searchQuery?: Object, options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    find(searchQuery: Object, options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    update(criteria: number, newValues: any, transaction?: Object): q.Promise<any>;
    update(criteria: Object, newValues: any, transaction?: Object): q.Promise<any>;
    delete(criteria: number, transaction?: Object): q.Promise<any>;
    delete(criteria: Object, transaction?: Object): q.Promise<any>;
}


interface IDaoFetchOptions {
    max?: number;
    offset?: number;
    getDeleted?: boolean;
    fields?: string[];
    sort?: Object[];
}









export class MysqlDao implements IDao {
    modelClass: typeof AbstractModel;
    tableName: string;
    logger: log4js.Logger;
    mysqlDelegate: MysqlDelegate;
    constructor(modelClass: typeof AbstractModel);
    create(data: Object[], transaction?: Object): q.Promise<any>;
    create(data: Object, transaction?: Object): q.Promise<any>;
    get(id: number[], options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    get(id: number, options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    search(searchQuery?: Object, options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    find(searchQuery: Object, options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    update(criteria: number, newValues: any, transaction?: Object): q.Promise<any>;
    update(criteria: Object, newValues: any, transaction?: Object): q.Promise<any>;
    delete(criteria: number, transaction?: Object): q.Promise<any>;
    delete(criteria: Object, transaction?: Object): q.Promise<any>;
    generateWhereStatements(criteria?: Object): {
        where: string[];
        values: any[];
    };
}







export class S3Dao implements IDao {
    private s3;
    private bucket;
    modelClass: typeof BaseS3Model;
    constructor(modelClass: typeof BaseS3Model, awsAccessKey: string, accessKeySecret: string, region: string, bucket: string);
    search(searchQuery?: BaseS3Model): q.Promise<BaseS3Model[]>;
    find(searchQuery: BaseS3Model): q.Promise<any>;
    update(criteria: BaseS3Model, newValues: BaseS3Model): q.Promise<any>;
    update(criteria: Object, newValues: Object): q.Promise<any>;
    delete(object: Object): q.Promise<any>;
    delete(object: BaseS3Model): q.Promise<any>;
    create(data: any, transaction?: Object): q.Promise<any>;
    get(id: any, options?: IDaoFetchOptions, transaction?: Object): q.Promise<any>;
    private copyFile(src, dest);
    private deleteFile(path);
    private moveFile(src, dest);
}








export class SolrDao implements IDao {
    private solrClient;
    modelClass: typeof AbstractModel;
    tableName: string;
    logger: log4js.Logger;
    constructor(modelClass: typeof AbstractModel, solrClient: Solr.SolrClient);
    create(data: Object[]): q.Promise<any>;
    create(data: Object): q.Promise<any>;
    get(id: any, options?: IDaoFetchOptions): q.Promise<any>;
    get(id: number, options?: IDaoFetchOptions): q.Promise<any>;
    search(searchQuery: Object, options?: IDaoFetchOptions): q.Promise<any>;
    find(searchQuery: Object, options?: IDaoFetchOptions): q.Promise<any>;
    update(criteria: number, newValues: any): q.Promise<any>;
    update(criteria: Object, newValues: any): q.Promise<any>;
    delete(criteria: number): q.Promise<any>;
    delete(criteria: Object): q.Promise<any>;
    generateWhereStatement(criteria?: Object): string[];
}









export class BaseDaoDelegate {
    logger: log4js.Logger;
    dao: IDao;
    constructor(dao: typeof BaseModel);
    constructor(dao: IDao);
    get(id: any, options?: IDaoFetchOptions, foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    find(search: Object, options?: IDaoFetchOptions, foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    search(search?: Object, options?: IDaoFetchOptions, foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    searchWithIncludes(search?: Object, options?: IDaoFetchOptions, includes?: Object[], transaction?: Object): q.Promise<any>;
    processIncludes(baseSearchResults: BaseModel[], search?: Object, options?: IDaoFetchOptions, includes?: Object[], transaction?: Object): q.Promise<any>;
    create(object: Object, transaction?: Object): q.Promise<any>;
    create(object: Object[], transaction?: Object): q.Promise<any>;
    update(criteria: Object, newValues: any, transaction?: Object): q.Promise<any>;
    update(criteria: number, newValues: any, transaction?: Object): q.Promise<any>;
    delete(criteria: number, softDelete?: boolean, transaction?: Object): q.Promise<any>;
    delete(criteria: Object, softDelete?: boolean, transaction?: Object): q.Promise<any>;
    save(object: Object, dbTransaction?: Object): q.Promise<any>;
}









export class BaseMappingDaoDelegate {
    logger: log4js.Logger;
    dao: MysqlDao;
    constructor(dao: typeof BaseModel);
    constructor(dao: MysqlDao);
    get(id: any, options?: IDaoFetchOptions, foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    find(search: Object, options?: IDaoFetchOptions, foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    search(search: Object, options?: IDaoFetchOptions, foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    searchWithIncludes(search?: Object, options?: IDaoFetchOptions, includes?: Object[], transaction?: Object): q.Promise<any>;
    processIncludes(baseSearchResults: BaseModel[], search?: Object, options?: IDaoFetchOptions, includes?: Object[], transaction?: Object): any;
    create(mappingObject: Object, object: Object, transaction?: Object): q.Promise<any>;
    update(criteria: Object, newValues: any, transaction?: Object): q.Promise<any>;
    update(criteria: number, newValues: any, transaction?: Object): q.Promise<any>;
    delete(criteria: number, softDelete?: boolean, transaction?: Object): q.Promise<any>;
    delete(criteria: Object, softDelete?: boolean, transaction?: Object): q.Promise<any>;
    save(object: Object, dbTransaction?: Object): q.Promise<any>;
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
    generate(type: string, shardId?: number): number;
}





export class ImageDelegate {
    imageMagick: any;
    resize(srcImagePath: string, outputPath: string, outputSize: ImageSize): q.Promise<any>;
    delete(srcImagePath: string): q.Promise<any>;
    move(oldPath: string, newPath: string): q.Promise<any>;
    fetch(imageUrl: string, tempPath: string): q.Promise<any>;
}



export class LocalizationDelegate {
    private static ctor;
    static get(key: string, data?: Object, locale?: string): string;
    static setLocale(locale: string): void;
}



export class MysqlDelegate {
    private static pool;
    private logger;
    constructor(host?: string, database?: string, user?: string, password?: string, socketPath?: string);
    createConnection(host: string, user: string, password: string, socketPath: string): q.Promise<any>;
    getConnectionFromPool(): q.Promise<any>;
    beginTransaction(transaction?: Object): q.Promise<any>;
    executeQuery(query: string, parameters?: any[], connection?: any): q.Promise<any>;
    executeInTransaction(thisArg: any, args?: IArguments): q.Promise<any>;
    commit(transaction: any, result?: any): q.Promise<any>;
}




export class Formatter {
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
    static setLongerTimeout(func: Function, interval: number, ...args: any[]): any;
    static generateUrl(urlPattern: string, values?: Object, baseUrl?: string): string;
    static removeParameterFromUrl(urlPattern: string): string;
}



export class sqlToModel {
    static sqlTypeToJsType(value: any): string;
    static sqlToObject(sql: string): Object;
    static sqlToModel(sql: string): string;
}





export class CacheHelper {
    private connection;
    constructor(host: string, port: number);
    getConnection(): redis.RedisClient;
    set(key: any, value: any, expiry?: number, overwrite?: boolean): q.Promise<any>;
    mget(keys: string[]): q.Promise<any>;
    get(key: string): q.Promise<any>;
    del(key: any): q.Promise<any>;
    createHash(set: any, values: any, keyFieldName: any, expiry: any): q.Promise<any>;
    addToHash(set: any, key: any, value: any): q.Promise<any>;
    getHashValues(set: any): q.Promise<any>;
    getHashKeys(set: any): q.Promise<any>;
    getHash(set: string): q.Promise<any>;
    getFromHash(set: any, key: any): q.Promise<any>;
    delFromHash(set: any, key: any): q.Promise<any>;
    addToOrderedSet(set: any, key: any, value: any): q.Promise<any>;
    addMultipleToOrderedSet(set: any, values: any, keyFieldName: any): q.Promise<any>;
    getOrderedSet(set: any): q.Promise<any>;
    getFromOrderedSet(set: any, key: any): q.Promise<any>;
    delFromOrderedSet(set: any, key: any): q.Promise<any>;
    setExpiry(key: any, expiry: any): q.Promise<any>;
    incrementCounter(counterName: string): q.Promise<any>;
    incrementHashKey(hash: string, counterName: string, increment?: number): q.Promise<any>;
    getKeys(nameOrPattern: string): q.Promise<string[]>;
    addToSet(set: string, key: string): q.Promise<boolean>;
    isMemberOfSet(set: string, key: string): q.Promise<boolean>;
    removeFromSet(set: string, key: string): q.Promise<boolean>;
}





export class BaseApi {
    static INCLUDE: string;
    constructor(app: any);
    static getEndpoint(baseUrl?: string): string;
    static getIdEndpoint(id?: number, baseUrl?: string): string;
    promiseMiddleware(handler: (...args) => q.Promise<any>): (req: express.Request, res: express.Response) => void;
}

}