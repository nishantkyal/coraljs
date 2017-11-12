import mysql                                        = require('mysql');
import log4js                                       = require('log4js');
import Utils                                        = require('../common/Utils');

/*
 Delegate class to manage mysql connections
 */
class MysqlDelegate {
    // Connection pool
    private static pool: any;
    private logger: log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor(host?: string, database?: string, user?: string, password?: string, socketPath?: string) {
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
    createConnection(host: string, user: string, password: string, socketPath: string): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
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

    /*
     * Helper method to get a connection from pool
     */
    async getConnectionFromPool(): Promise<any> {
        var self = this;
        return new Promise<string>((resolve, reject) => {
            MysqlDelegate.pool.getConnection(
                function handleConnection(err, connection) {
                    if (err) {
                        self.logger.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
                        reject('Failed to get a DB connection');
                    }
                    else if (connection)
                        resolve(connection);
                });
        });
    }

    /*
     * Begin a transaction and return the transaction
     */
    async beginTransaction(transaction?: Object): Promise<any> {
        var self = this;

        if (Utils.isNullOrEmpty(transaction)) {
            var connection = await self.getConnectionFromPool()
            self.logger.debug("Connection obtained");
            return new Promise<any>((resolve, reject) => {
                connection.beginTransaction(
                    function handleTransactionCallback(error, transaction) {
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
            return new Promise<any>((resolve) => {
                process.nextTick(function () {
                    resolve(transaction);
                });
            });
    }

    /*
     * Execute a query
     * Transaction/connection can be specified else query is executed in a new connection
     */
    async executeQuery(query: string, parameters?: any[], connection?: any): Promise<any> {
        // If transaction specified, use it
        var self = this;

        if (!connection)
            connection = await self.getConnectionFromPool();

        return new Promise<string>((resolve, reject) => {
            connection.query(query, parameters,
                function handleQueryExecuted(err, rows) {
                    connection.release();
                    if (err)
                        reject(err);
                    else
                        resolve(rows);
                });
        });
    }


    async executeInTransaction(thisArg, args ?: IArguments): Promise<any> {
        var self = this;

        var transaction = await self.beginTransaction();
        var newArgs = [].slice.call(args, 0);
        newArgs.push(transaction);

        return new Promise<string>((resolve, reject) => {
            return args.callee.apply(thisArg, newArgs)
                .then(
                    function operationCompleted(result) {
                        return self.commit(transaction, result);
                    },
                    function operationFailed(error: Error) {
                        transaction.rollback();
                        if (transaction)
                            transaction.release();
                        throw (error);
                    });
        });
    }

    /*
     * Commit transaction
     */
    commit(transaction, result ?: any): Promise<any> {
        return new Promise<string>((resolve, reject) => {
            transaction.commit(function transactionCommitted() {
                if (transaction)
                    transaction.release();
                resolve(result);
            });
        });
    }

}

export = MysqlDelegate