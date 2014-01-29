///<reference path='../_references.d.ts'/>
///<reference path='../common/Config.ts'/>
import q = require('q');

/**
 Delegate class to manage mysql connections
 **/
module delegates
{
    export class MysqlDelegate
    {

        // Connection pool
        private static pool:any;

        /** Static constructor workaround */
        private static ctor = (() =>
        {
            MysqlDelegate.pool = mysql.createPool({
                host: common.Config.get('database.host'),
                database: common.Config.get('database.name'),
                user: common.Config.get('database.user'),
                password: common.Config.get('database.pass'),
                supportBigNumbers: true
            });
        })();

        /**
         * Helper method to get a connection from pool
         */
        static createConnection():Q.Promise<any>
        {
            var deferred = q.defer();
            var connection = mysql.createConnection({
                host: common.Config.get('database.host'),
                user: common.Config.get('database.user'),
                password: common.Config.get('database.pass')
            });

            connection.connect(function (err)
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

        /**
         * Helper method to get a connection from pool
         */
        static getConnectionFromPool():Q.Promise<any>
        {
            var deferred = q.defer();
            MysqlDelegate.pool.getConnection(
                function handleConnection(err, connection)
                {
                    if (err)
                    {
                        console.error('MysqlDelegate: Failed to get new connection');
                        deferred.reject('Failed to get a DB connection');
                    }
                    else if (connection)
                        deferred.resolve(connection);
                });
            return deferred.promise;
        }

        /**
         * Begin a transaction and return the transaction
         */
        static beginTransaction():Q.Promise<any>
        {
            var deferred = q.defer();
            MysqlDelegate.getConnectionFromPool()
                .then(
                function handleConnection(connection)
                {
                    connection.transaction(
                        function handleTransactionCallback(error, transaction)
                        {
                            if (error)
                            {
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
        static executeQuery(query:string, parameters?:any[], connection?:any):Q.Promise<Array>
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
                function queryFailed(err)
                {
                    connection.release();
                    throw(err);
                });
        }

        /**
         * Commit transaction
         */
        static commit(transaction, result?:any):Q.Promise<any>
        {
            var deferred = q.defer();
            transaction.commit(function transactionCommitted()
            {
                deferred.resolve(result);
            });
            return deferred.promise;
        }

    }
}