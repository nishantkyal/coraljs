var q = require('q');
var redis = require('redis');
var Config = require('../Config');

/**
Base class for all caches
**/
var CacheHelper = (function () {
    function CacheHelper() {
    }
    CacheHelper.getConnection = function () {
        this.connection = this.connection ? this.connection : redis.createClient(Config.get("redis.port"), Config.get("redis.host"), { connect_timeout: 60000 });
        this.connection.on('error', function (error) {
            console.log(error);
        });
        return this.connection;
    };

    CacheHelper.set = function (key, value) {
        var deferred = q.defer();
        this.getConnection().set(key, JSON.stringify(value), function (error, result) {
            if (error)
                deferred.reject(error);
else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    };

    CacheHelper.get = function (key) {
        var deferred = q.defer();
        this.getConnection().set(key, function (error, result) {
            if (error)
                deferred.reject(null);
else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    };

    CacheHelper.del = function (key) {
        var deferred = q.defer();
        this.getConnection().del(key, function (error, result) {
            if (error)
                deferred.reject(null);
else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    };

    CacheHelper.createHash = /* Manipulate hashes */
    function (set, values, keyFieldName, expiry) {
        // Create a clone for addition since we'll be removing from it to keep count
        var deferred = q.defer();
        var clonedValues = JSON.parse(JSON.stringify(values));
        var row = clonedValues.shift();
        this.addToHash(set, row[keyFieldName], row).then(function (error, result) {
            if (clonedValues.length == 0) {
                if (expiry > 0)
                    setInterval(function () {
                        CacheHelper.del(set);
                    }, expiry);
                return deferred.resolve(result);
            } else
                return CacheHelper.createHash(set, clonedValues, keyFieldName, expiry);
        });
        return deferred.promise;
    };

    CacheHelper.addToHash = function (set, key, value) {
        var deferred = q.defer();
        this.delFromHash(set, key).then(function () {
            CacheHelper.getConnection().hset(set, key, JSON.stringify(value), function (error, result) {
                if (error)
                    deferred.reject(null);
else
                    deferred.resolve(JSON.parse(result));
            });
        });
        return deferred.promise;
    };

    CacheHelper.getHashValues = function (set) {
        var deferred = q.defer();
        this.getConnection().hvals(set, function (error, result) {
            if (result && result.length != 0) {
                var values = [];
                for (var i = 0; i < result.length; i++) {
                    values.push(JSON.parse(result[i]));
                }
                deferred.resolve(values);
            } else
                deferred.reject(error);
        });
        return deferred.promise;
    };

    CacheHelper.getHashKeys = function (set) {
        var deferred = q.defer();
        this.getConnection().hkeys(set, function (error, result) {
            if (result && result.length != 0)
                deferred.resolve(result);
else
                deferred.reject(null);
        });
        return deferred.promise;
    };

    CacheHelper.getFromHash = function (set, key) {
        var deferred = q.defer();
        this.getConnection().hget(set, key, function (error, result) {
            if (error)
                deferred.reject(null);
else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    };

    CacheHelper.delFromHash = function (set, key) {
        var deferred = q.defer();
        this.getConnection().hdel(set, key, function (error, result) {
            if (error)
                deferred.reject(null);
else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    };

    CacheHelper.addToOrderedSet = /* MANIPULATE ORDERED SETS */
    function (set, key, value) {
        var deferred = q.defer();
        this.delFromOrderedSet(set, key).then(function () {
            CacheHelper.getConnection().hset(set, key, JSON.stringify(value), function (error, result) {
                if (error)
                    deferred.reject(null);
else
                    deferred.resolve(JSON.parse(result));
            });
        });
        return deferred.promise;
    };

    CacheHelper.addMultipleToOrderedSet = function (set, values, keyFieldName) {
        // Create a clone for addition since we'll be removing from it to keep count
        var deferred = q.defer();
        var clonedValues = JSON.parse(JSON.stringify(values));
        var row = clonedValues.shift();
        this.addToOrderedSet(set, row[keyFieldName], row).then(function () {
            if (clonedValues.length == 0)
                deferred.resolve(null);
else
                CacheHelper.addMultipleToOrderedSet(set, clonedValues, keyFieldName);
        });
        return deferred.promise;
    };

    CacheHelper.getOrderedSet = function (set) {
        var deferred = q.defer();
        this.getConnection().zcard(set, function (err, count) {
            CacheHelper.getConnection().zrange(set, 0, count, function (error, result) {
                if (result && result.length != 0) {
                    var values = [];
                    for (var i = 0; i < result.length; i++) {
                        values.push(JSON.parse(result[i]));
                    }
                    deferred.resolve(values);
                } else
                    deferred.reject(error);
            });
        });
        return deferred.promise;
    };

    CacheHelper.getFromOrderedSet = function (set, key) {
        var deferred = q.defer();
        this.getConnection().zrevrangebyscore(set, key, key, function (error, result) {
            if (error)
                deferred.reject(null);
else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    };

    CacheHelper.delFromOrderedSet = function (set, key) {
        var deferred = q.defer();
        return this.getConnection().zremrangebyscore(set, key, key, function (error, result) {
            if (error)
                deferred.reject(null);
else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    };
    return CacheHelper;
})();

module.exports = CacheHelper;

//# sourceMappingURL=CacheHelper.js.map
