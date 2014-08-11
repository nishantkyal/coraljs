import ForeignKey = require('../models/ForeignKey');
declare class AbstractModel {
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
export = AbstractModel;
