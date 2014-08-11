import BaseModel = require('./BaseModel');
import ForeignKeyType = require('../enums/ForeignKeyType');
declare class ForeignKey {
    public type: ForeignKeyType;
    public src_key: string;
    public referenced_table: typeof BaseModel;
    public target_key: string;
    public local_property_to_set: string;
    constructor(type: ForeignKeyType, srcKey: string, referenced_table: typeof BaseModel, targetKey: string, localPropertyToSet?: string);
    public getSourcePropertyName(): string;
    public toString(): string;
}
export = ForeignKey;
