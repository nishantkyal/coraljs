"use strict";
const _ = require("underscore");
const redis = require("redis");
const Utils = require("../common/Utils");
class CacheHelper {
    constructor(host, port) {
        this.connection = redis.createClient(port, host);
        this.connection.on('error', function (error) {
            throw (error);
        });
    }
    getConnection() {
        return this.connection;
    }
    set(key, value, expiry, overwrite = false) {
        return new Promise((resolve, reject) => {
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
    mget(keys) {
        var self = this;
        return new Promise((resolve, reject) => {
            if (Utils.isNullOrEmpty(keys))
                process.nextTick(function () {
                    resolve(keys);
                });
            self.getConnection().mget(keys, function (error, result) {
                if (error)
                    return reject(error);
                if (Utils.isNullOrEmpty(result))
                    return resolve(result);
                resolve(_.map(result, function (row) {
                    return JSON.parse(row);
                }));
            });
        });
    }
    get(key) {
        var self = this;
        return new Promise((resolve, reject) => {
            process.nextTick(function () {
                resolve(key);
            });
            self.getConnection().get(key, function (error, result) {
                if (error)
                    return reject(error);
                if (Utils.isNullOrEmpty(result))
                    return resolve(result);
                resolve(JSON.parse(result));
            });
        });
    }
    del(key) {
        return new Promise((resolve, reject) => {
            this.getConnection().del(key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    createHash(set, values, keyFieldName, expiry) {
        var self = this;
        return new Promise((resolve, reject) => {
            var clonedValues = JSON.parse(JSON.stringify(values));
            var row = clonedValues.shift();
            self.addToHash(set, row[keyFieldName], row)
                .then(function (result) {
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
    addToHash(set, key, value) {
        var self = this;
        return new Promise((resolve, reject) => {
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
    getHashValues(set) {
        return new Promise((resolve, reject) => {
            var self = this;
            self.getConnection().hvals(set, function (error, result) {
                if (result) {
                    if (Utils.getObjectType(result) == 'Array')
                        resolve(_.map(result, function (row) {
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
    getHashKeys(set) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().hkeys(set, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    getHash(set) {
        var self = this;
        return Promise.all([
            self.getHashKeys(set),
            self.getHashValues(set)
        ])
            .then(function valuesFetched(...args) {
            var keys = args[0][0];
            var values = args[0][1];
            var indexed = {};
            _.each(keys, function (code, index) {
                indexed[code] = values[index];
            });
            return indexed;
        });
    }
    getFromHash(set, key) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().hget(set, key, function (error, result) {
                if (error)
                    reject(error);
                else if (Utils.getObjectType(result) == 'Array')
                    resolve(_.map(result, function (row) {
                        return JSON.parse(row);
                    }));
                else
                    resolve(JSON.parse(result));
            });
        });
    }
    delFromHash(set, key) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().hdel(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    addToOrderedSet(set, key, value) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.delFromOrderedSet(set, key)
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
    addMultipleToOrderedSet(set, values, keyFieldName) {
        var self = this;
        return new Promise((resolve, reject) => {
            var clonedValues = JSON.parse(JSON.stringify(values));
            var row = clonedValues.shift();
            self.addToOrderedSet(set, row[keyFieldName], row)
                .then(function () {
                if (clonedValues.length == 0)
                    resolve(null);
                else
                    self.addMultipleToOrderedSet(set, clonedValues, keyFieldName);
            });
        });
    }
    getOrderedSet(set) {
        var self = this;
        return new Promise((resolve, reject) => {
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
    getFromOrderedSet(set, key) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().zrevrangebyscore(set, key, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    delFromOrderedSet(set, key) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().zremrangebyscore(set, key, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    try {
                        resolve(result);
                    }
                    catch (e) {
                    }
            });
        });
    }
    setExpiry(key, expiry) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().expire(key, expiry, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    incrementCounter(counterName) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().incr(counterName, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    incrementHashKey(hash, counterName, increment = 1) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().hincrby(hash, counterName, increment, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    getKeys(nameOrPattern) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().keys(nameOrPattern, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    addToSet(set, key) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().sadd(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    isMemberOfSet(set, key) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().sismember(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
    removeFromSet(set, key) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getConnection().srem(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
}
module.exports = CacheHelper;
//# sourceMappingURL=CacheHelper.js.map