import BaseModel                                            = require('./BaseModel');
import TransactionLine                                      = require('./TransactionLine');
import Utils                                                = require('../common/Utils');
import TransactionStatus                                    = require('../enums/TransactionStatus');

class Transaction extends BaseModel
{
    static TABLE_NAME:string = 'transaction';

    static USER_ID:string                                   = 'user_id';
    static PAYMENT_ID:string                                = 'payment_id';
    static STATUS:string                                    = 'status';
    static TRANSACTION_LINE:string                          = 'transaction_line';

    static DEFAULT_FIELDS:string[] = [Transaction.ID, Transaction.USER_ID, Transaction.PAYMENT_ID, Transaction.STATUS];

    private user_id:number;
    private payment_id:number;
    private status:TransactionStatus;

    private transaction_line:TransactionLine[];

    /* Getters */
    getUserId():number                                      { return this.user_id; }
    getPaymentId():number                                   { return this.payment_id; }
    getStatus():TransactionStatus                           { return this.status; }
    getTransactionLine():TransactionLine[]                  { return this.transaction_line; }

    /* Setters */
    setUserId(val:number):void                              { this.user_id = val; }
    setPaymentId(val:number):void                           { this.payment_id = val; }
    setStatus(val:TransactionStatus):void                   { this.status = val; }
    setTransactionLine(val:TransactionLine[]):void         { this.transaction_line= val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getUserId());
    }
}
export = Transaction