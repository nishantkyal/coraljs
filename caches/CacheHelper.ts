///<reference path='../_references.d.ts'/>
import _                                            = require('underscore');
import q                                            = require('q');
import redis                                        = require('redis');
import Config                                       = require('../common/Config');
import Utils                                        = require('../common/Utils');

/*
 Base class for all caches
 */
class CacheHelper
{
    private connection:redis.RedisClient;

    constructor(port:number)
    {
        // We're going to maintain just one connection to redis since both node and redis are single threaded
        this.connection = redis.createClient(port, Config.get(Config.REDIS_HOST), {connect_timeout: 60000});
        this.connection.on('error', function (error)
        {
            console.log(error);
        })
    }

    getConnection():redis.RedisClient           { return this.connection; }

    set(key, value, expiry?:number, overwrite:boolean = false):q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        var args = [key, JSON.stringify(value)];

        if (expiry)
            args.concat(['EX', expiry]);
        if (!overwrite)
            args.push('NX');

        self.getConnection().set(args, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(result);
        });
        return deferred.promise;
    }

    get(key):q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        this.getConnection().get(key, function (error, result:any)
        {
            if (error)
                deferred.reject(error);
            else
            {
                if (Utils.getObjectType(result) == 'Array')
                    deferred.resolve(_.map(result, function (row:any)
                    {
                        return JSON.parse(row);
                    }));
                else
                    deferred.resolve(JSON.parse(result));
            }
        });
        return deferred.promise;
    }

    del(key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().del(key, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(result);
        });
        return deferred.promise;
    }

    /* Manipulate hashes */
    createHash(set, values, keyFieldName, expiry):q.Promise<any>
    {
        // Create a clone for addition since we'll be removing from it to keep count
        var self = this;
        var deferred = q.defer();
        var clonedValues = JSON.parse(JSON.stringify(values));
        var row = clonedValues.shift();

        this.addToHash(set, row[keyFieldName], row)
            .then(
            function (result):any
            {
                if (clonedValues.length == 0)
                {
                    if (expiry > 0)
                        setInterval(function ()
                        {
                            self.del(set);
                        }, expiry);
                    return deferred.resolve(result);
                }
                else
                    return self.createHash(set, clonedValues, keyFieldName, expiry);
            });
        return deferred.promise;
    }

    addToHash(set, key, value):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer();

        this.delFromHash(set, key)
            .then(function ()
            {
                self.getConnection().hset(set, key, JSON.stringify(value), function (error, result)
                {
                    if (error)
                        deferred.reject(error);
                    else
                        deferred.resolve(result);
                });
            });
        return deferred.promise;
    }

    getHashValues(set):q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        self.getConnection().hvals(set, function (error, result:any)
        {
            if (result)
            {
                if (Utils.getObjectType(result) == 'Array')
                    deferred.resolve(_.map(result, function (row:any)
                    {
                        return JSON.parse(row);
                    }));
                else
                    deferred.resolve(JSON.parse(result));
            }
            else
                deferred.reject(error);
        });
        return deferred.promise;
    }

    getHashKeys(set):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().hkeys(set, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(result);
        });
        return deferred.promise;
    }

    getHash(set:string):q.Promise<any>
    {
        var self = this;

        return q.all([
                self.getHashKeys(set),
                self.getHashValues(set)
            ])
            .then(
            function valuesFetched(...args)
            {
                var keys = args[0][0];
                var values = args[0][1];
                var indexed = {};
                _.each(keys, function(code:string, index) {
                    indexed[code] = values[index];
                });
                return indexed;
            });
    }

    getFromHash(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().hget(set, key, function (error, result:any)
        {
            if (error)
                deferred.reject(error);
            else if (Utils.getObjectType(result) == 'Array')
                deferred.resolve(_.map(result, function (row:any)
                {
                    return JSON.parse(row);
                }));
            else
                deferred.resolve(JSON.parse(result));
        });
        return deferred.promise;
    }

    delFromHash(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().hdel(set, key, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(result);
        });
        return deferred.promise;
    }

    /* MANIPULATE ORDERED SETS */
    addToOrderedSet(set, key, value):q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        this.delFromOrderedSet(set, key)
            .then(
            function ()
            {
                self.getConnection().hset(set, key, JSON.stringify(value), function (error, result)
                {
                    if (error)
                        deferred.reject(error);
                    else
                        deferred.resolve(result);
                });
            }
        );
        return deferred.promise;
    }

    addMultipleToOrderedSet(set, values, keyFieldName):q.Promise<any>
    {
        // Create a clone for addition since we'll be removing from it to keep count
        var self = this;
        var deferred = q.defer();
        var clonedValues = JSON.parse(JSON.stringify(values));
        var row = clonedValues.shift();

        this.addToOrderedSet(set, row[keyFieldName], row)
            .then(
            function ()
            {
                if (clonedValues.length == 0)
                    deferred.resolve(null);
                else
                    self.addMultipleToOrderedSet(set, clonedValues, keyFieldName);
            });
        return deferred.promise;
    }

    getOrderedSet(set):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer();

        this.getConnection().zcard(set, function (err, count)
        {
            self.getConnection().zrange(set, 0, count, function (error, result)
            {
                if (result)
                    deferred.resolve(result);
                else
                    deferred.reject(error);
            });
        });
        return deferred.promise;
    }

    getFromOrderedSet(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        this.getConnection().zrevrangebyscore(set, key, key, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(result);
        });
        return deferred.promise;
    }

    delFromOrderedSet(set, key):q.Promise<any>
    {
        var deferred = q.defer();
        return this.getConnection().zremrangebyscore(set, key, key, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                try
                {
                    deferred.resolve(result);
                } catch (e)
                {

                }
        });
        return deferred.promise;
    }

    setExpiry(key, expiry):q.Promise<any>
    {
        var deferred = q.defer();
        return this.getConnection().expire(key, expiry, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(result);
        });
        return deferred.promise;
    }

    incrementCounter(counterName:string, increment:number = 1):q.Promise<any>
    {
        var deferred = q.defer();
        return this.getConnection().incr(counterName, function (error, result)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(result);
        });
        return deferred.promise;
    }

}
export = CacheHelper