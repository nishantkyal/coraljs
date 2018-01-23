import _                                            = require('underscore');
import redis                                        = require('redis');
import Utils                                        = require('../common/Utils');

/*
 Base class for all caches
 */
class CacheHelper {
    private connection: redis.RedisClient;

    constructor(host: string, port: number) {
        // We're going to maintain just one connection to redis since both node and redis are single threaded
        this.connection = redis.createClient(port, host);
        this.connection.on('error', function (error) {
            throw(error);
        });
    }

    getConnection(): redis.RedisClient {
        return this.connection;
    }

    set(key, value, expiry?: number, overwrite: boolean = false): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var self = this;

            var args = [key, JSON.stringify(value)];

            if (expiry)
                args.concat(['EX', expiry]);
            if (!overwrite)
                args.push('NX');

            self.getConnection().set(args, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    mget(keys: string[]): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            if (Utils.isNullOrEmpty(keys))
                process.nextTick(function () {
                    resolve(keys);
                });

            self.getConnection().mget(keys, function (error, result: any) {
                if (error)
                    return reject(error);

                if (Utils.isNullOrEmpty(result))
                    return resolve(result);

                resolve(_.map(result, function (row: string) {
                    return JSON.parse(row);
                }));
            });

        });
    }

    get(key: string): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            process.nextTick(function () {
                resolve(key);
            });

            self.getConnection().get(key, function (error, result: any) {
                if (error)
                    return reject(error);

                if (Utils.isNullOrEmpty(result))
                    return resolve(result);

                resolve(JSON.parse(result));
            });

        });
    }

    del(key): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getConnection().del(key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    /* Manipulate hashes */
    createHash(set, values, keyFieldName, expiry): Promise<any> {
        // Create a clone for addition since we'll be removing from it to keep count
        var self = this;
        return new Promise<any>((resolve, reject) => {
            var clonedValues = JSON.parse(JSON.stringify(values));
            var row = clonedValues.shift();

            self.addToHash(set, row[keyFieldName], row)
                .then(
                    function (result): any {
                        if (clonedValues.length == 0) {
                            if (expiry > 0)
                                setInterval(function () {
                                    self.del(set);
                                }, expiry);
                            return resolve(result);
                        }
                        else
                            return self.createHash(set, clonedValues, keyFieldName, expiry);
                    });
        });
    }

    addToHash(set, key, value): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.delFromHash(set, key)
                .then(function () {
                    self.getConnection().hset(set, key, JSON.stringify(value), function (error, result) {
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                });
        });
    }

    getHashValues(set): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var self = this;

            self.getConnection().hvals(set, function (error, result: any) {
                if (result) {
                    if (Utils.getObjectType(result) == 'Array')
                        resolve(_.map(result, function (row: string) {
                            return JSON.parse(row);
                        }));
                    else
                        resolve(JSON.parse(result));
                }
                else
                    reject(error);
            });
        });
    }

    getHashKeys(set): Promise<any> {
        var self = this;

        return new Promise<any>((resolve, reject) => {
            self.getConnection().hkeys(set, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    getHash(set: string): Promise<any> {
        var self = this;

        return Promise.all([
            self.getHashKeys(set),
            self.getHashValues(set)
        ])
            .then(
                function valuesFetched(...args) {
                    var keys: string[] = args[0][0];
                    var values = args[0][1];
                    var indexed = {};
                    _.each(keys, function (code: string, index) {
                        indexed[code] = values[index];
                    });
                    return indexed;
                });
    }

    getFromHash(set, key): Promise<any> {
        var self = this;

        return new Promise<any>((resolve, reject) => {
            self.getConnection().hget(set, key, function (error, result: any) {
                if (error)
                    reject(error);
                else if (Utils.getObjectType(result) == 'Array')
                    resolve(_.map(result, function (row: any) {
                        return JSON.parse(row);
                    }));
                else
                    resolve(JSON.parse(result));
            });
        });
    }

    delFromHash(set, key): Promise<any> {
        var self = this;

        return new Promise<any>((resolve, reject) => {
            self.getConnection().hdel(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    /* MANIPULATE ORDERED SETS */
    addToOrderedSet(set, key, value): Promise<any> {
        var self = this;

        return new Promise<any>((resolve, reject) => {
            self.delFromOrderedSet(set, key)
                .then(
                    function () {
                        self.getConnection().hset(set, key, JSON.stringify(value), function (error, result) {
                            if (error)
                                reject(error);
                            else
                                resolve(result);
                        });
                    }
                );
        });
    }

    addMultipleToOrderedSet(set, values, keyFieldName): Promise<any> {
        // Create a clone for addition since we'll be removing from it to keep count
        var self = this;
        return new Promise<any>((resolve, reject) => {
            var clonedValues = JSON.parse(JSON.stringify(values));
            var row = clonedValues.shift();

            self.addToOrderedSet(set, row[keyFieldName], row)
                .then(
                    function () {
                        if (clonedValues.length == 0)
                            resolve(null);
                        else
                            self.addMultipleToOrderedSet(set, clonedValues, keyFieldName);
                    });
        });
    }

    getOrderedSet(set): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.getConnection().zcard(set, function (err, count) {
                self.getConnection().zrange(set, 0, count, function (error, result) {
                    if (result)
                        resolve(result);
                    else
                        reject(error);
                });
            });
        });
    }

    getFromOrderedSet(set, key): Promise<any> {
        var self = this;

        return new Promise<any>((resolve, reject) => {
            self.getConnection().zrevrangebyscore(set, key, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    delFromOrderedSet(set, key): Promise<any> {
        var self = this;

        return new Promise<any>((resolve, reject) => {
            self.getConnection().zremrangebyscore(set, key, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    try {
                        resolve(result);
                    } catch (e) {

                    }
            });
        });
    }

    setExpiry(key, expiry): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.getConnection().expire(key, expiry, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    incrementCounter(counterName: string): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.getConnection().incr(counterName, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    incrementHashKey(hash: string, counterName: string, increment: number = 1): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.getConnection().hincrby(hash, counterName, increment, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    getKeys(nameOrPattern: string): Promise<string[]> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
                self.getConnection().keys(nameOrPattern, function (error, result) {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            });
    }

    /* Sets */
    addToSet(set: string, key: string): Promise<boolean> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.getConnection().sadd(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    isMemberOfSet(set: string, key: string): Promise<boolean> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.getConnection().sismember(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

    removeFromSet(set: string, key: string): Promise<boolean> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            self.getConnection().srem(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }

}

export = CacheHelper