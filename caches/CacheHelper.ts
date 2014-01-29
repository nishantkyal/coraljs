///<reference path='../_references.d.ts'/>
///<reference path='../common/Config.ts'/>

/**
 Base class for all caches
 **/
module caches
{
    export class CacheHelper
    {
        private static connection;
    
        private static getConnection()
        {
            //this.connection = this.connection ? this.connection : redis.createClient(Config.get("redis.port"), Config.get("redis.host"), {connect_timeout: 60000});
            this.connection.on('error', function (error) {
                console.log(error);
            })
            return this.connection;
        }
    
        static set(key, value, expiry?:number):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().set(key, JSON.stringify(value), 'EX', expiry, function(error, result)
            {
                if (error)
                    deferred.reject(error);
                else
                    deferred.resolve(null);
            });
            return deferred.promise;
    
        }
    
        static get(key):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().get(key, function(error, result)
            {
                if (error)
                    deferred.reject(null);
                else
                    deferred.resolve(JSON.parse(result));
            });
            return deferred.promise;
        }
    
        static del(key):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().del(key, function(error, result)
            {
                if (error)
                    deferred.reject(null);
                else
                    deferred.resolve(JSON.parse(result));
            });
            return deferred.promise;
        }
    
        /* Manipulate hashes */
        static createHash(set, values, keyFieldName, expiry)
        {
            // Create a clone for addition since we'll be removing from it to keep count
            var deferred = q.defer();
            var clonedValues = JSON.parse(JSON.stringify(values));
            var row = clonedValues.shift();
            this.addToHash(set, row[keyFieldName], row)
                .then(
                function(error, result)
                {
                    if (clonedValues.length == 0) {
                        if (expiry > 0)
                            setInterval(function()
                            {
                                CacheHelper.del(set);
                            }, expiry);
                        return deferred.resolve(result);
                    }
                    else
                        return CacheHelper.createHash(set, clonedValues, keyFieldName, expiry);
                });
            return deferred.promise;
        }
    
        static addToHash(set, key, value):Q.Promise<any>
        {
            var deferred = q.defer();
            this.delFromHash(set, key)
                .then(function()
                {
                    CacheHelper.getConnection().hset(set, key, JSON.stringify(value), function(error, result)
                    {
                        if (error)
                            deferred.reject(null);
                        else
                            deferred.resolve(JSON.parse(result));
                    })
                });
            return deferred.promise;
        }
    
        static getHashValues(set):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().hvals(set, function(error, result)
            {
                if (result && result.length != 0) {
                    var values = [];
                    for (var i = 0; i < result.length; i++) {
                        values.push(JSON.parse(result[i]));
                    }
                    deferred.resolve(values);
                }
                else
                    deferred.reject(error);
            });
            return deferred.promise;
        }
    
        static getHashKeys(set):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().hkeys(set, function(error, result)
            {
                if (result && result.length != 0)
                    deferred.resolve(result);
                else
                    deferred.reject(null);
            });
            return deferred.promise;
        }
    
        static getFromHash(set, key):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().hget(set, key, function(error, result)
            {
                if (error)
                    deferred.reject(null);
                else
                    deferred.resolve(JSON.parse(result));
            });
            return deferred.promise;
        }
    
        static delFromHash(set, key):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().hdel(set, key, function(error, result)
            {
                if (error)
                    deferred.reject(null);
                else
                    deferred.resolve(JSON.parse(result));
            });
            return deferred.promise;
        }
    
        /* MANIPULATE ORDERED SETS */
        static addToOrderedSet(set, key, value):Q.Promise<any>
        {
            var deferred = q.defer();
            this.delFromOrderedSet(set, key)
                .then(
                function()
                {
                    CacheHelper.getConnection().hset(set, key, JSON.stringify(value), function(error, result)
                    {
                        if (error)
                            deferred.reject(null);
                        else
                            deferred.resolve(JSON.parse(result));
                    });
                }
            );
            return deferred.promise;
        }
    
        static addMultipleToOrderedSet(set, values, keyFieldName):Q.Promise<any>
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
    
        static getOrderedSet(set):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().zcard(set, function(err, count)
            {
                CacheHelper.getConnection().zrange(set, 0, count, function(error, result)
                {
                    if (result && result.length != 0) {
                        var values = [];
                        for (var i = 0; i < result.length; i++) {
                            values.push(JSON.parse(result[i]));
                        }
                        deferred.resolve(values);
                    }
                    else
                        deferred.reject(error);
                });
            });
            return deferred.promise;
        }
    
        static getFromOrderedSet(set, key):Q.Promise<any>
        {
            var deferred = q.defer();
            this.getConnection().zrevrangebyscore(set, key, key, function(error, result)
            {
                if (error)
                    deferred.reject(null);
                else
                    deferred.resolve(JSON.parse(result));
            });
            return deferred.promise;
        }
    
        static delFromOrderedSet(set, key):Q.Promise<any>
        {
            var deferred = q.defer();
            return this.getConnection().zremrangebyscore(set, key, key, function(error, result)
            {
                if (error)
                    deferred.reject(null);
                else
                    deferred.resolve(JSON.parse(result));
            });
            return deferred.promise;
        }
    
        static setExpiry(key, expiry):Q.Promise<any>
        {
            var deferred = q.defer();
            return this.getConnection().expire(key, expiry, function(error, result)
            {
                if (error)
                    deferred.reject(null);
                else
                    deferred.resolve(JSON.parse(result));
            });
            return deferred.promise;
        }
    
    }
}