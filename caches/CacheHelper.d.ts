/// <reference path="../_references.d.ts" />
import q = require('q');
import redis = require('redis');
declare class CacheHelper {
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
export = CacheHelper;
