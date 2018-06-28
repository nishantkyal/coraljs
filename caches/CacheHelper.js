"use strict";
var _ = require("underscore");
var redis = require("redis");
var Utils = require("../common/Utils");
/*
 Base class for all caches
 */
var CacheHelper = (function () {
    function CacheHelper(host, port) {
        // We're going to maintain just one connection to redis since both node and redis are single threaded
        this.connection = redis.createClient(port, host);
        this.connection.on('error', function (error) {
            throw (error);
        });
    }
    CacheHelper.prototype.getConnection = function () {
        return this.connection;
    };
    CacheHelper.prototype.set = function (key, value, expiry, overwrite) {
        var _this = this;
        if (overwrite === void 0) { overwrite = false; }
        return new Promise(function (resolve, reject) {
            var self = _this;
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
    };
    CacheHelper.prototype.mget = function (keys) {
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.get = function (key) {
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.del = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getConnection().del(key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    /* Manipulate hashes */
    CacheHelper.prototype.createHash = function (set, values, keyFieldName, expiry) {
        // Create a clone for addition since we'll be removing from it to keep count
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.addToHash = function (set, key, value) {
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.getHashValues = function (set) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var self = _this;
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
    };
    CacheHelper.prototype.getHashKeys = function (set) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().hkeys(set, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    CacheHelper.prototype.getHash = function (set) {
        var self = this;
        return Promise.all([
            self.getHashKeys(set),
            self.getHashValues(set)
        ])
            .then(function valuesFetched() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var keys = args[0][0];
            var values = args[0][1];
            var indexed = {};
            _.each(keys, function (code, index) {
                indexed[code] = values[index];
            });
            return indexed;
        });
    };
    CacheHelper.prototype.getFromHash = function (set, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.delFromHash = function (set, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().hdel(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    /* MANIPULATE ORDERED SETS */
    CacheHelper.prototype.addToOrderedSet = function (set, key, value) {
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.addMultipleToOrderedSet = function (set, values, keyFieldName) {
        // Create a clone for addition since we'll be removing from it to keep count
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.getOrderedSet = function (set) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().zcard(set, function (err, count) {
                self.getConnection().zrange(set, 0, count, function (error, result) {
                    if (result)
                        resolve(result);
                    else
                        reject(error);
                });
            });
        });
    };
    CacheHelper.prototype.getFromOrderedSet = function (set, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().zrevrangebyscore(set, key, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    CacheHelper.prototype.delFromOrderedSet = function (set, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
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
    };
    CacheHelper.prototype.setExpiry = function (key, expiry) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().expire(key, expiry, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    CacheHelper.prototype.incrementCounter = function (counterName) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().incr(counterName, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    CacheHelper.prototype.incrementHashKey = function (hash, counterName, increment) {
        if (increment === void 0) { increment = 1; }
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().hincrby(hash, counterName, increment, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    CacheHelper.prototype.getKeys = function (nameOrPattern) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().keys(nameOrPattern, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    /* Sets */
    CacheHelper.prototype.addToSet = function (set, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().sadd(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    CacheHelper.prototype.isMemberOfSet = function (set, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().sismember(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    CacheHelper.prototype.removeFromSet = function (set, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getConnection().srem(set, key, function (error, result) {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    };
    return CacheHelper;
}());
module.exports = CacheHelper;
//# sourceMappingURL=CacheHelper.js.map