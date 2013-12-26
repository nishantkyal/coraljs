import mysql                = require('mysql');
import q                    = require('q');
import Config               = require('../Config');

/**
 Delegate class to manage mysql connections
 **/
class MysqlDelegate {

    // Connection pool
    private static pool:any;

    /** Static constructor workaround */
    private static ctor = (() =>
    {
        MysqlDelegate.pool = mysql.createPool({
            host    : Config.get('database.host'),
            database: Config.get('database.name'),
            user    : Config.get('database.user'),
            password: Config.get('database.pass')
        });
    })();

    /**
     * Helper method to get a connection from pool
     */
    static getConnectionFromPool():q.makePromise
    {
        var deferred = q.defer();
        MysqlDelegate.pool.getConnection(
            function handleConnection(err, connection)
            {
                if (err) {
                    console.error('MysqlDelegate: Failed to get new connection');
                    deferred.reject('Failed to get a DB connection');
                }
                else
                    if (connection)
                        deferred.resolve(connection);
            });
        return deferred.promise;
    }

    /**
     * Begin a transaction and return the transaction
     */
    static beginTransaction():q.makePromise
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

    /**
     * Execute a query
     * Transaction/connection can be specified else query is executed in a new connection
     */
    static executeQuery(query:string, parameters?:any[], connection?:any):q.makePromise
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
            function queryFailed(err) {
                connection.release();
                throw(err);
            });
    }

    /**
     * Commit transaction
     */
    static commit(transaction, result?:any):q.makePromise
    {
        var deferred = q.defer();
        transaction.commit(function transactionCommitted()
        {
            transaction.close();
            deferred.resolve(result);
        });
        return deferred.promise;
    }

}
export = MysqlDelegate