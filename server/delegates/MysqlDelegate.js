"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mysql = require("mysql");
const log4js = require("log4js");
const Utils = require("../common/Utils");
class MysqlDelegate {
    constructor(host, database, user, password, socketPath) {
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
    createConnection(host, user, password, socketPath) {
        var self = this;
        return new Promise((resolve, reject) => {
            var connection = mysql.createConnection({
                host: host,
                user: user,
                password: password,
                socketPath: socketPath
            });
            connection.connect(function (err) {
                if (err) {
                    self.logger.error('Error when establishing a mysql connection, error: ' + err);
                    reject(err);
                }
                else
                    resolve(connection);
            });
        });
    }
    getConnectionFromPool() {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            return new Promise((resolve, reject) => {
                MysqlDelegate.pool.getConnection(function handleConnection(err, connection) {
                    if (err) {
                        self.logger.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
                        reject('Failed to get a DB connection');
                    }
                    else if (connection)
                        resolve(connection);
                });
            });
        });
    }
    beginTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            if (Utils.isNullOrEmpty(transaction)) {
                var connection = yield self.getConnectionFromPool();
                self.logger.debug("Connection obtained");
                return new Promise((resolve, reject) => {
                    connection.beginTransaction(function handleTransactionCallback(error) {
                        if (error) {
                            self.logger.error("Failed to start a transaction");
                            reject('Failed to start a transaction');
                        }
                        else {
                            self.logger.debug("Transaction started");
                            resolve(connection);
                        }
                    });
                });
            }
            else
                return new Promise((resolve) => {
                    process.nextTick(function () {
                        resolve(transaction);
                    });
                });
        });
    }
    executeQuery(query, parameters, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            if (!connection)
                connection = yield self.getConnectionFromPool();
            return new Promise((resolve, reject) => {
                connection.query(query, parameters, function handleQueryExecuted(err, rows) {
                    connection.destroy();
                    if (err)
                        reject(err);
                    else
                        resolve(rows);
                });
            });
        });
    }
    executeInTransaction(thisArg, args) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            var transaction = yield self.beginTransaction();
            var newArgs = [].slice.call(args, 0);
            newArgs.push(transaction);
            return new Promise((resolve, reject) => {
                return args.callee.apply(thisArg, newArgs)
                    .then(function operationCompleted(result) {
                    return self.commit(transaction, result);
                }, function operationFailed(error) {
                    transaction.rollback();
                    if (transaction)
                        transaction.destroy();
                    throw (error);
                });
            });
        });
    }
    commit(transaction, result) {
        return new Promise((resolve, reject) => {
            transaction.commit(function transactionCommitted() {
                if (transaction)
                    transaction.destroy();
                resolve(result);
            });
        });
    }
}
module.exports = MysqlDelegate;
//# sourceMappingURL=MysqlDelegate.js.map