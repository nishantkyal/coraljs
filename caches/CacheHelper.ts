///<reference path='../_references.d.ts'/>
import q                = require('q');
import redis            = require('redis');
import Config           = require('../common/Config');

/*
 Base class for all caches
 */
class CacheHelper
{
    private static connection;

    private static getConnection()
    {
        this.connection = this.connection ? this.connection : redis.createClient(Config.get("redis.port"), Config.get("redis.host"), {connect_timeout: 60000});
        this.connection.on('error', function (error) {
            console.log(error);
        })
        return this.connection;
    }

    static set(key, value, expiry?:number):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().set(key, JSON.stringify(value), 'EX', expiry, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;

    }

    static get(key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().get(key, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

    static del(key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().del(key, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

    /* Manipulate hashes */
    static createHash(set, values, keyFieldName, expiry):q.Promise<any>
    {
        // Create a clone for addition since we'll be removing from it to keep count
        var deferred = q.defer();
        var clonedValues = JSON.parse(JSON.stringify(values));
        var row = clonedValues.shift();
        this.addToHash(set, row[keyFieldName], row)
            .then(
            function(result):any
            {
                if (clonedValues.length == 0) {
                    if (expiry > 0)
                        setInterval(function()
                        {
                            CacheHelper.del(set);
                        }, expiry);
                    return deferred.resolve(JSON.parse(result));
                }
                else
                    return CacheHelper.createHash(set, clonedValues, keyFieldName, expiry);
            });
        return deferred.promise;
    }

    static addToHash(set, key, value):q.Promise<any>
    {
        var deferred = q.defer();
        this.delFromHash(set, key)
            .then(function()
            {
                CacheHelper.getConnection().hset(set, key, JSON.stringify(value), function(error, result)
                {
                    if (error)
                        deferred.reject(error);
                    else
                        deferred.resolve(JSON.parse(result));
                })
            });
        return deferred.promise;
    }

    static getHashValues(set):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().hvals(set, function(error, result)
        {
            if (result)
                deferred.resolve(JSON.parse(result));
            else
                deferred.reject(error);
        });
        return deferred.promise;
    }

    static getHashKeys(set):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().hkeys(set, function(error, result)
        {
            if (result)
                deferred.resolve(JSON.parse(result));
            else
                deferred.reject(error);
        });
        return deferred.promise;
    }

    static getFromHash(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().hget(set, key, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

    static delFromHash(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().hdel(set, key, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

    /* MANIPULATE ORDERED SETS */
    static addToOrderedSet(set, key, value):q.Promise<any>
    {
        var deferred = q.defer();
        this.delFromOrderedSet(set, key)
            .then(
            function()
            {
                CacheHelper.getConnection().hset(set, key, JSON.stringify(value), function(error, result)
                {
                    if (error)
                        deferred.reject(error);
                    else
                        deferred.resolve(JSON.parse(result));
                });
            }
        );
        return deferred.promise;
    }

    static addMultipleToOrderedSet(set, values, keyFieldName):q.Promise<any>
    {
        // Create a clone for addition since we'll be removing from it to keep count
        var deferred = q.defer();
        var clonedValues = JSON.parse(JSON.stringify(values));
        var row = clonedValues.shift();
        this.addToOrderedSet(set, row[keyFieldName], row)
            .then(
            function()
            {
                if (clonedValues.length == 0)
                    deferred.resolve(null);
                else
                    CacheHelper.addMultipleToOrderedSet(set, clonedValues, keyFieldName);
            });
        return deferred.promise;
    }

    static getOrderedSet(set):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().zcard(set, function(err, count)
        {
            CacheHelper.getConnection().zrange(set, 0, count, function(error, result)
            {
                if (result)
                    deferred.resolve(JSON.parse(result));
                else
                    deferred.reject(error);
            });
        });
        return deferred.promise;
    }

    static getFromOrderedSet(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().zrevrangebyscore(set, key, key, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

    static delFromOrderedSet(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        return this.getConnection().zremrangebyscore(set, key, key, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

    static setExpiry(key, expiry):q.Promise<any>
    {
        var deferred = q.defer();
        return this.getConnection().expire(key, expiry, function(error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

}
export = CacheHelper