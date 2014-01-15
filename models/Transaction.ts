import BaseModel                = require('./BaseModel');

class Transaction extends BaseModel
{
    static TABLE_NAME:string = 'transaction';
    static PRIMARY_KEY:string = 'transaction_id';

    private transaction_id:string;
    private user_id:number;
    private total:number;
    private total_unit:number;
    private status:number;

    /* Getters */
    getTransactionId():string { return this.transaction_id; }
    getUserId():number { return this.user_id; }
    getTotal():number { return this.total; }
    getTotalUnit():number { return this.total_unit; }
    getStatus():number { return this.status; }

    /* Setters */
    setTransactionId(val:string):void { this.transaction_id = val; }
    setUserId(val:number):void { this.user_id = val; }
    setTotal(val:number):void { this.total = val; }
    setTotalUnit(val:number):void { this.total_unit = val; }
    setStatus(val:number):void { this.status = val; }

}
export = Transaction