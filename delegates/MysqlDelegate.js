"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var mysql = require("mysql");
var log4js = require("log4js");
var Utils = require("../common/Utils");
/*
 Delegate class to manage mysql connections
 */
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
    /*
     * Helper method to get a connection from pool
     */
    MysqlDelegate.prototype.createConnection = function (host, database, user, password, socketPath) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var connection = mysql.createConnection({
                host: host,
                database: database,
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
    };
    /*
     * Helper method to get a connection from pool
     */
    MysqlDelegate.prototype.getConnectionFromPool = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        MysqlDelegate.pool.getConnection(function handleConnection(err, connection) {
                            if (err) {
                                self.logger.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
                                reject('Failed to get a DB connection');
                            }
                            else if (connection)
                                resolve(connection);
                        });
                    })];
            });
        });
    };
    /*
     * Begin a transaction and return the transaction
     */
    MysqlDelegate.prototype.beginTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var self, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        if (!Utils.isNullOrEmpty(transaction)) return [3 /*break*/, 2];
                        return [4 /*yield*/, self.getConnectionFromPool()];
                    case 1:
                        connection = _a.sent();
                        self.logger.debug("Connection obtained");
                        return [2 /*return*/, new Promise(function (resolve, reject) {
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
                            })];
                    case 2: return [2 /*return*/, new Promise(function (resolve) {
                            process.nextTick(function () {
                                resolve(transaction);
                            });
                        })];
                }
            });
        });
    };
    /*
     * Execute a query
     * Transaction/connection can be specified else query is executed in a new connection
     */
    MysqlDelegate.prototype.executeQuery = function (query, parameters, connection) {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        if (!!connection) return [3 /*break*/, 2];
                        return [4 /*yield*/, self.getConnectionFromPool()];
                    case 1:
                        connection = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            connection.query(query, parameters, function handleQueryExecuted(err, rows) {
                                connection.destroy();
                                if (err)
                                    reject(err);
                                else
                                    resolve(rows);
                            });
                        })];
                }
            });
        });
    };
    MysqlDelegate.prototype.executeInTransaction = function (thisArg, args) {
        return __awaiter(this, void 0, void 0, function () {
            var self, transaction, newArgs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.beginTransaction()];
                    case 1:
                        transaction = _a.sent();
                        newArgs = [].slice.call(args, 0);
                        newArgs.push(transaction);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                return args.callee.apply(thisArg, newArgs)
                                    .then(function operationCompleted(result) {
                                    return self.commit(transaction, result);
                                }, function operationFailed(error) {
                                    transaction.rollback();
                                    if (transaction)
                                        transaction.destroy();
                                    throw (error);
                                });
                            })];
                }
            });
        });
    };
    /*
     * Commit transaction
     */
    MysqlDelegate.prototype.commit = function (transaction, result) {
        return new Promise(function (resolve, reject) {
            transaction.commit(function transactionCommitted() {
                if (transaction)
                    transaction.destroy();
                resolve(result);
            });
        });
    };
    return MysqlDelegate;
}());
module.exports = MysqlDelegate;
//# sourceMappingURL=MysqlDelegate.js.map