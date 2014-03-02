import BaseModel                = require('./BaseModel');
import TransactionLine          = require('./TransactionLine');
import Utils                    = require('../common/Utils');

class Transaction extends BaseModel
{
    static TABLE_NAME:string = 'transaction';

    static USER_ID:string = 'user_id';
    static TOTAL:string = 'total';
    static TOTAL_UNIT:string = 'total_unit';
    static STATUS:string = 'status';
    static TRANSACTION_LINES:string = 'transaction_lines';

    private user_id:number;
    private total:number;
    private total_unit:number;
    private status:number;

    private transaction_lines:TransactionLine[];

    /* Getters */
    getUserId():number { return this.user_id; }
    getTotal():number { return this.total; }
    getTotalUnit():number { return this.total_unit; }
    getStatus():number { return this.status; }

    /* Setters */
    setUserId(val:number):void { this.user_id = val; }
    setTotal(val:number):void { this.total = val; }
    setTotalUnit(val:number):void { this.total_unit = val; }
    setStatus(val:number):void { this.status = val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getUserId())
                && !Utils.isNullOrEmpty(this.transaction_lines)
                    && _.filter(this.transaction_lines, function isTransactionLineValid(tl:TransactionLine) {
            return tl.isValid();
        }).length == this.transaction_lines.length;
    }
}
export = Transaction