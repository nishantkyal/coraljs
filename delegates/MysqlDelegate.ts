import mysql                                        = require('mysql');
import q                                            = require('q');
import log4js                                       = require('log4js');
import Utils                                        = require('../common/Utils');

/*
 Delegate class to manage mysql connections
 */
class MysqlDelegate
{
    // Connection pool
    private static pool:any;
    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor(host?:string, database?:string, user?:string, password?:string, socketPath?:string)
    {
        if (Utils.isNullOrEmpty(MysqlDelegate.pool) && !Utils.isNullOrEmpty(host))
        {
            MysqlDelegate.pool = mysql.createPool({
                host: host,
                database: database,
                user: user,
                password: password,
                socketPath: socketPath,
                supportBigNumbers: true
            });
        }
    }

    /*
     * Helper method to get a connection from pool
     */
    createConnection(host:string, user:string, password:string, socketPath:string):q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        var connection = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            socketPath: socketPath
        });

        connection.connect(function (err)
        {
            if (err)
            {
                self.logger.error('Error when establishing a mysql connection, error: ' + err);
                deferred.reject(err);
            }
            else
                deferred.resolve(connection);
        });
        return deferred.promise;
    }

    /*
     * Helper method to get a connection from pool
     */
    getConnectionFromPool():q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        MysqlDelegate.pool.getConnection(
            function handleConnection(err, connection)
            {
                if (err)
                {
                    self.logger.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
                    deferred.reject('Failed to get a DB connection');
                }
                else if (connection)
                    deferred.resolve(connection);
            });
        return deferred.promise;
    }

    /*
     * Begin a transaction and return the transaction
     */
    beginTransaction(transaction?:Object):q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return self.getConnectionFromPool()
                .then(
                function handleConnection(connection)
                {
                    self.logger.debug("Connection obtained");
                    connection.beginTransaction(
                        function handleTransactionCallback(error, transaction)
                        {
                            if (error)
                            {
                                self.logger.error("Failed to start a transaction");
                                deferred.reject('Failed to start a transaction');
                            }
                            else
                            {
                                self.logger.debug("Transaction started");
                                deferred.resolve(transaction);
                            }
                        });
                });
        else
            process.nextTick(function ()
            {
                deferred.resolve(transaction);
            });

        return deferred.promise;
    }

    /*
     * Execute a query
     * Transaction/connection can be specified else query is executed in a new connection
     */
    executeQuery(query:string, parameters?:any[], connection?:any):q.Promise<any>
    {
        // If transaction specified, use it
        var self = this;

        if (connection)
        {
            var deferred = q.defer();
            connection.query(query, parameters,
                function handleQueryExecuted(err, rows)
                {
                    if (err)
                        deferred.reject(err);
                    else
                        deferred.resolve(rows);
                });
            return deferred.promise;
        }

        // Else get a new connection
        return self.getConnectionFromPool()
            .then(
            function handleConnection(c)
            {
                connection = c;
                return self.executeQuery(query, parameters, connection);
            })
            .then(
            function queryExecuted(rows)
            {
                connection.release();
                return rows;
            },
            function queryFailed(err:Error)
            {
                connection.release();
                throw(err);
            });
    }

    executeInTransaction(thisArg, args?:IArguments):q.Promise<any>
    {
        var transaction;
        var self = this;

        return self.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                var newArgs = [].slice.call(args, 0);
                newArgs.push(transaction);
                return args.callee.apply(thisArg, newArgs);
            })
            .then(
            function operationCompleted(result)
            {
                return self.commit(transaction, result);
            },
            function operationFailed(error:Error)
            {
                transaction.rollback();
                throw (error);
            });
    }

    /*
     * Commit transaction
     */
    commit(transaction, result?:any):q.Promise<any>
    {
        var deferred = q.defer();
        transaction.commit(function transactionCommitted()
        {
            deferred.resolve(result);
        });
        return deferred.promise;
    }

}
export = MysqlDelegate