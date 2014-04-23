import BaseModel                                        = require('./BaseModel');
import MoneyUnit                                        = require('../enums/MoneyUnit');

class Payment extends BaseModel
{
    static TABLE_NAME:string = 'payment';

    static USER_ID:string = 'user_id';
    static AMOUNT:string = 'amount';
    static AMOUNT_UNIT:string = 'amount_unit';
    static STATUS:string = 'status';

    private user_id:number;
    private amount:number;
    private amount_unit:MoneyUnit;
    private status:number;

    /* Getters */
    getUserId():number                                  { return this.user_id; }
    getAmount():number                                  { return this.amount; }
    getAmountUnit():MoneyUnit                           { return this.amount_unit; }
    getStatus():number                                  { return this.status; }

    /* Setters */
    setUserId(val:number):void                          { this.user_id = val; }
    setAmount(val:number):void                          { this.amount = val; }
    setAmountUnit(val:MoneyUnit):void                   { this.amount_unit = val; }
    setStatus(val:number):void                          { this.status = val; }
}
export = Payment