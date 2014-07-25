import BaseModel                                            = require('./BaseModel');
import TransactionLine                                      = require('./TransactionLine');
import Utils                                                = require('../common/Utils');
import TransactionStatus                                    = require('../enums/TransactionStatus');

class Transaction extends BaseModel
{
    static TABLE_NAME:string = 'transaction';

    static COL_USER_ID:string                                   = 'user_id';
    static COL_PAYMENT_ID:string                                = 'payment_id';
    static COL_STATUS:string                                    = 'status';
    static COL_TRANSACTION_LINE:string                          = 'transaction_line';

    static DEFAULT_FIELDS:string[] = [Transaction.COL_ID, Transaction.COL_USER_ID, Transaction.COL_PAYMENT_ID, Transaction.COL_STATUS];

    private user_id:number;
    private payment_id:number;
    private status:TransactionStatus;

    /* Getters */
    getUserId():number                                      { return this.user_id; }
    getPaymentId():number                                   { return this.payment_id; }
    getStatus():TransactionStatus                           { return this.status; }
    getTransactionLine():TransactionLine[]                  { return null; }

    /* Setters */
    setUserId(val:number):void                              { this.user_id = val; }
    setPaymentId(val:number):void                           { this.payment_id = val; }
    setStatus(val:TransactionStatus):void                   { this.status = val; }
    setTransactionLine(val:TransactionLine[]):void          {  }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getUserId());
    }
}
export = Transaction