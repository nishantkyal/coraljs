/// <reference path="../_references.d.ts" />
import q = require('q');
declare class MysqlDelegate {
    private static pool;
    private static logger;
    private static ctor;
    static createConnection(host?: string, user?: string, password?: string, socketPath?: string): q.Promise<any>;
    static getConnectionFromPool(): q.Promise<any>;
    static beginTransaction(transaction?: Object): q.Promise<any>;
    static executeQuery(query: string, parameters?: any[], connection?: any): q.Promise<any>;
    static executeInTransaction(thisArg: any, args?: IArguments): q.Promise<any>;
    static commit(transaction: any, result?: any): q.Promise<any>;
}
export = MysqlDelegate;
