import BaseModel                = require('./BaseModel');
import TransactionLine          = require('./TransactionLine');
import Utils                    = require('../common/Utils');
import TransactionStatus        = require('../enums/TransactionStatus');
import MoneyUnit                = require('../enums/MoneyUnit');

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
    private total_unit:MoneyUnit;
    private status:TransactionStatus;

    private transaction_lines:TransactionLine[];

    /* Getters */
    getUserId():number { return this.user_id; }
    getTotal():number { return this.total; }
    getTotalUnit():MoneyUnit { return this.total_unit; }
    getStatus():TransactionStatus { return this.status; }

    /* Setters */
    setUserId(val:number):void { this.user_id = val; }
    setTotal(val:number):void { this.total = val; }
    setTotalUnit(val:MoneyUnit):void { this.total_unit = val; }
    setStatus(val:TransactionStatus):void { this.status = val; }

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