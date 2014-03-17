///<reference path='../_references.d.ts'/>
import mysql                = require('mysql');
import q                    = require('q');
import log4js               = require('log4js');
import Config               = require('../common/Config');

/*
 Delegate class to manage mysql connections
 */
class MysqlDelegate {

    // Connection pool
    private static pool:any;

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        MysqlDelegate.pool = mysql.createPool({
            host             : Config.get(Config.DATABASE_HOST),
            database         : Config.get(Config.DATABASE_NAME),
            user             : Config.get(Config.DATABASE_USER),
            password         : Config.get(Config.DATABASE_PASS),
            socketPath:     Config.get(Config.DATABASE_SOCKET),
            supportBigNumbers: true
        });
    })();

    /*
     * Helper method to get a connection from pool
     */
    static createConnection():q.Promise<any>
    {
        var deferred = q.defer();
        var connection = mysql.createConnection({
            host             : Config.get(Config.DATABASE_HOST),
            user             : Config.get(Config.DATABASE_USER),
            password         : Config.get(Config.DATABASE_PASS),
            socketPath:     Config.get(Config.DATABASE_SOCKET)
        });

        connection.connect(function(err)
        {
            if (err)
            {
                log4js.getDefaultLogger().error('Error when establishing a mysql connection, error: ' + err);
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
                if (err) {
                    console.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
                    deferred.reject('Failed to get a DB connection');
                }
                else
                    if (connection)
                        deferred.resolve(connection);
            });
        return deferred.promise;
    }

    /*
     * Begin a transaction and return the transaction
     */
    static beginTransaction():q.Promise<any>
    {
        var deferred = q.defer();
        MysqlDelegate.getConnectionFromPool()
            .then(
            function handleConnection(connection)
            {
                connection.transaction(
                    function handleTransactionCallback(error, transaction)
                    {
                        if (error) {
                            console.error("MysqlDelegate: Failed to start a transaction");
                            deferred.reject('Failed to start a transaction');
                        }
                        else
                            deferred.resolve(transaction);
                    });
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
        if (connection) {
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
            function queryFailed(err)
            {
                connection.release();
                throw(err);
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