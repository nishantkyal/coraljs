import BaseModel                = require('./BaseModel');

class Payment extends BaseModel
{
    static TABLE_NAME:string = 'payment';
    static PRIMARY_KEY:string = 'id';

    private payment_id:string;
    private user_id:number;
    private amount:number;
    private update_date:number;
    private transaction_id:string;
    private status:number;

    /* Getters */
    getPaymentId():string { return this.payment_id; }
    getUserId():number { return this.user_id; }
    getAmount():number { return this.amount; }
    getUpdateDate():number { return this.update_date; }
    getTransactionId():string { return this.transaction_id; }
    getStatus():number { return this.status; }

    /* Setters */
    setPaymentId(val:string):void { this.payment_id = val; }
    setUserId(val:number):void { this.user_id = val; }
    setAmount(val:number):void { this.amount = val; }
    setUpdateDate(val:number):void { this.update_date = val; }
    setTransactionId(val:string):void { this.transaction_id = val; }
    setStatus(val:number):void { this.status = val; }

}
export = Payment