var mysql = require('mysql');
var q = require('q');
var log4js = require('log4js');
var Utils = require('../common/Utils');
var MysqlDelegate = (function () {
    function MysqlDelegate(host, database, user, password, socketPath) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        if (Utils.isNullOrEmpty(MysqlDelegate.pool) && !Utils.isNullOrEmpty(host)) {
            MysqlDelegate.pool = mysql.createPool({
                host: host,
                database: database,
                user: user,
                password: password,
                socketPath: socketPath,
                supportBigNumbers: true,
                waitForConnections: false,
                connectionLimit: 20
            });
        }
    }
    MysqlDelegate.prototype.createConnection = function (host, user, password, socketPath) {
        var deferred = q.defer();
        var self = this;
        var connection = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            socketPath: socketPath
        });
        connection.connect(function (err) {
            if (err) {
                self.logger.error('Error when establishing a mysql connection, error: ' + err);
                deferred.reject(err);
            }
            else
                deferred.resolve(connection);
        });
        return deferred.promise;
    };
    MysqlDelegate.prototype.getConnectionFromPool = function () {
        var deferred = q.defer();
        var self = this;
        MysqlDelegate.pool.getConnection(function handleConnection(err, connection) {
            if (err) {
                self.logger.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
                deferred.reject('Failed to get a DB connection');
            }
            else if (connection)
                deferred.resolve(connection);
        });
        return deferred.promise;
    };
    MysqlDelegate.prototype.beginTransaction = function (transaction) {
        var deferred = q.defer();
        var self = this;
        if (Utils.isNullOrEmpty(transaction))
            self.getConnectionFromPool().then(function handleConnection(connection) {
                self.logger.debug("Connection obtained");
                connection.beginTransaction(function handleTransactionCallback(error, transaction) {
                    if (error) {
                        self.logger.error("Failed to start a transaction");
                        deferred.reject('Failed to start a transaction');
                    }
                    else {
                        self.logger.debug("Transaction started");
                        deferred.resolve(connection);
                    }
                });
            });
        else
            process.nextTick(function () {
                deferred.resolve(transaction);
            });
        return deferred.promise;
    };
    MysqlDelegate.prototype.executeQuery = function (query, parameters, connection) {
        var self = this;
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
        return self.getConnectionFromPool().then(function handleConnection(c) {
            connection = c;
            return self.executeQuery(query, parameters, connection);
        }).then(function queryExecuted(rows) {
            connection.release();
            return rows;
        }, function queryFailed(err) {
            if (connection)
                connection.release();
            throw (err);
        });
    };
    MysqlDelegate.prototype.executeInTransaction = function (thisArg, args) {
        var transaction;
        var self = this;
        return self.beginTransaction().then(function transactionStarted(t) {
            transaction = t;
            var newArgs = [].slice.call(args, 0);
            newArgs.push(transaction);
            return args.callee.apply(thisArg, newArgs);
        }).then(function operationCompleted(result) {
            return self.commit(transaction, result);
        }, function operationFailed(error) {
            transaction.rollback();
            if (transaction)
                transaction.release();
            throw (error);
        });
    };
    MysqlDelegate.prototype.commit = function (transaction, result) {
        var deferred = q.defer();
        transaction.commit(function transactionCommitted() {
            if (transaction)
                transaction.release();
            deferred.resolve(result);
        });
        return deferred.promise;
    };
    return MysqlDelegate;
})();
module.exports = MysqlDelegate;
//# sourceMappingURL=MysqlDelegate.js.map