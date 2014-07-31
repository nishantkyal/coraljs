///<reference path='../_references.d.ts'/>
import mysql                                        = require('mysql');
import q                                            = require('q');
import log4js                                       = require('log4js');
import Config                                       = require('../common/Config');
import Utils                                        = require('../common/Utils');
/*
 Delegate class to manage mysql connections
 */
class MysqlDelegate
{
    // Connection pool
    private static pool:any;
    private static logger:log4js.Logger = log4js.getLogger('MysqlDelegate');

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        MysqlDelegate.pool = mysql.createPool({
            host: Config.get(Config.DATABASE_HOST),
            database: Config.get(Config.DATABASE_NAME),
            user: Config.get(Config.DATABASE_USER),
            password: Config.get(Config.DATABASE_PASS),
            socketPath: Config.get(Config.DATABASE_SOCKET),
            supportBigNumbers: true
        });
    })();

    /*
     * Helper method to get a connection from pool
     */
    static createConnection(host:string = Config.get(Config.DATABASE_HOST), user:string = Config.get(Config.DATABASE_USER), password:string = Config.get(Config.DATABASE_PASS), socketPath:string = Config.get(Config.DATABASE_SOCKET)):q.Promise<any>
    {
        var deferred = q.defer();
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
                MysqlDelegate.logger.error('Error when establishing a mysql connection, error: ' + err);
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
    static getConnectionFromPool():q.Promise<any>
    {
        var deferred = q.defer();
        MysqlDelegate.pool.getConnection(
            function handleConnection(err, connection)
            {
                if (err)
                {
                    MysqlDelegate.logger.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
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
    static beginTransaction(transaction?:Object):q.Promise<any>
    {
        var deferred = q.defer();

        if (Utils.isNullOrEmpty(transaction))
            MysqlDelegate.getConnectionFromPool()
                .then(
                function handleConnection(connection)
                {
                    MysqlDelegate.logger.debug("Connection obtained");
                    connection.transaction(
                        function handleTransactionCallback(error, transaction)
                        {
                            if (error)
                            {
                                MysqlDelegate.logger.error("Failed to start a transaction");
                                deferred.reject('Failed to start a transaction');
                            }
                            else
                            {
                                MysqlDelegate.logger.debug("Transaction started");
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
    static executeQuery(query:string, parameters?:any[], connection?:any):q.Promise<any>
    {
        // If transaction specified, use it
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
        return MysqlDelegate.getConnectionFromPool()
            .then(
            function handleConnection(c)
            {
                connection = c;
                return MysqlDelegate.executeQuery(query, parameters, connection);
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

    static executeInTransaction(thisArg, args?:IArguments):q.Promise<any>
    {
        var transaction;

        return MysqlDelegate.beginTransaction()
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
                return MysqlDelegate.commit(transaction, result);
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
    static commit(transaction, result?:any):q.Promise<any>
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