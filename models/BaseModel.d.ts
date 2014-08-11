import AbstractModel = require('./AbstractModel');
declare class BaseModel extends AbstractModel {
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
export = BaseModel;
