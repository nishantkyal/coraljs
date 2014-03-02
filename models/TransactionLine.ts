import BaseModel                = require('./BaseModel');
import Utils                    = require('../common/Utils');
import MoneyUnit                = require('../enums/MoneyUnit');

class TransactionLine extends BaseModel
{
    static TABLE_NAME:string = 'transaction_line';

    static TRANSACTION_ID:string = 'transaction_id';
    static PRODUCT_ID:string = 'product_id';
    static PRODUCT_TYPE:string = 'product_type';
    static TRANSACTION_TYPE:string = 'transaction_type';
    static AMOUNT:string = 'amount';
    static AMOUNT_UNIT:string = 'amount_unit';

    private transaction_id:number;
    private product_id:number;
    private product_type:number;
    private transaction_type:number;
    private amount:number;
    private amount_unit:MoneyUnit;

    getTransactionId():number { return this.transaction_id; }
    getProductId():number { return this.product_id; }
    getProductType():number { return this.product_type; }
    getTransactionType():number { return this.transaction_type; }
    getAmount():number { return this.amount; }
    getAmountUnit():MoneyUnit { return this.amount_unit; }

    setTransactionId(val:number):void { this.transaction_id = val; }
    setProductId(val:number):void { this.product_id = val; }
    setProductType(val:number):void { this.product_type = val; }
    setTransactionType(val:number):void { this.transaction_type = val; }
    setAmount(val:number):void { this.amount = val; }
    setAmountUnit(val:MoneyUnit):void { this.amount_unit = val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getTransactionId())
                    && !Utils.isNullOrEmpty(this.getProductType());
    }
}
export = TransactionLine