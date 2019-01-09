import mysql                                        = require('mysql');
import log4js                                       = require('log4js');
import Utils                                        = require('../common/Utils');

/*
 Delegate class to manage mysql connections
 */
class MysqlDelegate {
    // Connection pool
    private static pool: mysql.Pool;
    private logger: log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private mysqlHost:string;
    private mysqlDb:string;
    private mysqlUser:string;
    private mysqlPassword:string;
    private mysqlSocket:string;
    private poolWaitForConnections:boolean;
    private poolQueueLimit:number;
    private poolConnectionLimit:number;

    constructor(host?: string, database?: string, user?: string, password?: string, socketPath?: string, usePool:boolean = true) {
        this.mysqlHost = host;
        this.mysqlDb = database;
        this.mysqlUser = user;
        this.mysqlPassword = password;
        this.mysqlSocket = socketPath;

        if (Utils.isNullOrEmpty(MysqlDelegate.pool) && !Utils.isNullOrEmpty(host) && usePool) {
            MysqlDelegate.pool = mysql.createPool({
                host: host,
                database: database,
                user: user,
                password: password,
                socketPath: socketPath,
                supportBigNumbers: true,
                waitForConnections: true,
                connectionLimit: 20
            });
        }
    }

    /*
     * Helper method to get a connection from pool
     */
    private async getConnection(): Promise<mysql.Connection> {
        var self = this;
        return new Promise<mysql.Connection>((resolve, reject) => {

            if (!Utils.isNullOrEmpty(MysqlDelegate.pool))
            {
                MysqlDelegate.pool.getConnection(
                    function handleConnection(err, connection) {
                        if (err) {
                            self.logger.error('MysqlDelegate: Failed to get new connection, error: %s', JSON.stringify(err));
                            reject('Failed to get a DB connection');
                        }
                        else if (connection)
                            resolve(connection);
                    });
            } else {
                var connection = mysql.createConnection({
                    host: self.mysqlHost,
                    database: self.mysqlDb,
                    user: self.mysqlUser,
                    password: self.mysqlPassword,
                    socketPath: self.mysqlSocket
                });

                connection.connect(function (err) {
                    if (err) {
                        self.logger.error('Error when establishing a mysql connection, error: ' + err);
                        reject(err);
                    }
                    else
                        resolve(connection);
                });
            }

        });
    }

    /*
     * Begin a transaction and return the transaction
     */
    async beginTransaction(transaction?: mysql.Connection): Promise<mysql.Connection> {
        var self = this;

        if (Utils.isNullOrEmpty(transaction)) {
            var connection = await self.getConnection()
            self.logger.debug("Connection obtained");
            return new Promise<mysql.Connection>((resolve, reject) => {
                connection.beginTransaction(
                    function handleTransactionCallback(error:mysql.MysqlError) {
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
            return new Promise<mysql.Connection>((resolve) => {
                process.nextTick(function () {
                    resolve(transaction);
                });
            });
    }

    /*
     * Execute a query
     * Transaction/connection can be specified else query is executed in a new connection
     */
    async executeQuery(query: string, parameters?: any[], connection?: mysql.Connection): Promise<any> {
        // If transaction specified, use it
        var self = this;

        if (!connection)
            connection = await self.getConnection();

        return new Promise<string>((resolve, reject) => {
            connection.query(query, parameters,
                function handleQueryExecuted(err, rows) {
                    connection.destroy();
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
                            transaction.destroy();
                        throw (error);
                    });
        });
    }

    /*
     * Commit transaction
     */
    commit(transaction:mysql.Connection, result ?: any): Promise<any> {
        return new Promise<string>((resolve, reject) => {
            transaction.commit(function transactionCommitted() {
                if (transaction)
                    transaction.destroy();
                resolve(result);
            });
        });
    }

}
export = MysqlDelegate