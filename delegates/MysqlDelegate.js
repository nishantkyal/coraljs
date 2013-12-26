var mysql = require('mysql');
var q = require('q');
var Config = require('../Config');

/**
Delegate class to manage mysql connections
**/
var MysqlDelegate = (function () {
    function MysqlDelegate() {
    }
    MysqlDelegate.getConnectionFromPool = /**
    * Helper method to get a connection from pool
    */
    function () {
        var deferred = q.defer();
        MysqlDelegate.pool.getConnection(function handleConnection(err, connection) {
            if (err) {
                console.error('MysqlDelegate: Failed to get new connection');
                deferred.reject('Failed to get a DB connection');
            } else if (connection)
                deferred.resolve(connection);
        });
        return deferred.promise;
    };

    MysqlDelegate.beginTransaction = /**
    * Begin a transaction and return the transaction
    */
    function () {
        var deferred = q.defer();
        MysqlDelegate.getConnectionFromPool().then(function handleConnection(connection) {
            connection.transaction(function handleTransactionCallback(error, transaction) {
                if (error) {
                    console.error("MysqlDelegate: Failed to start a transaction");
                    deferred.reject('Failed to start a transaction');
                } else
                    deferred.resolve(transaction);
            });
        });
        return deferred.promise;
    };

    MysqlDelegate.executeQuery = /**
    * Execute a query
    * Transaction/connection can be specified else query is executed in a new connection
    */
    function (query, parameters, connection) {
        if (connection) {
            var deferred = q.defer();
            connection.query(query, parameters, function handleQueryExecuted(err, rows) {
                if (err)
                    deferred.reject(err);
else
                    deferred.resolve(rows);
            });
            return deferred.promise;
        }

        // Else get a new connection
        return MysqlDelegate.getConnectionFromPool().then(function handleConnection(c) {
            connection = c;
            return MysqlDelegate.executeQuery(query, parameters, connection);
        }).then(function queryExecuted(rows) {
            connection.release();
            return rows;
        }, function queryFailed(err) {
            connection.release();
            throw (err);
        });
    };

    MysqlDelegate.commit = /**
    * Commit transaction
    */
    function (transaction, result) {
        var deferred = q.defer();
        transaction.commit(function transactionCommitted() {
            transaction.close();
            deferred.resolve(result);
        });
        return deferred.promise;
    };
    MysqlDelegate.ctor = (function () {
        MysqlDelegate.pool = mysql.createPool({
            host: Config.get('database.host'),
            database: Config.get('database.name'),
            user: Config.get('database.user'),
            password: Config.get('database.pass')
        });
    })();
    return MysqlDelegate;
})();

module.exports = MysqlDelegate;

//# sourceMappingURL=MysqlDelegate.js.map
