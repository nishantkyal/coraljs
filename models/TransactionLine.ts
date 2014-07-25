import BaseModel                                        = require('./BaseModel');
import Utils                                            = require('../common/Utils');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import TransactionType                                  = require('../enums/TransactionType');
import ItemType                                         = require('../enums/ItemType');

class TransactionLine extends BaseModel
{
    static TABLE_NAME:string = 'transaction_line';

    static COL_TRANSACTION_ID:string                        = 'transaction_id';
    static COL_ITEM_ID:string                               = 'item_id';
    static COL_ITEM_TYPE:string                             = 'item_type';
    static COL_TRANSACTION_TYPE:string                      = 'transaction_type';
    static COL_AMOUNT:string                                = 'amount';
    static COL_AMOUNT_UNIT:string                           = 'amount_unit';

    static DEFAULT_FIELDS:string[] = [TransactionLine.COL_ID, TransactionLine.COL_TRANSACTION_ID, TransactionLine.COL_ITEM_ID, TransactionLine.COL_ITEM_TYPE,
                                        TransactionLine.COL_TRANSACTION_TYPE, TransactionLine.COL_AMOUNT, TransactionLine.COL_AMOUNT_UNIT];

    private transaction_id:number;
    private item_id:number;
    private item_type:ItemType;
    private transaction_type:TransactionType;
    private amount:number;
    private amount_unit:MoneyUnit;

    getTransactionId():number                           { return this.transaction_id; }
    getItemId():number                                  { return this.item_id; }
    getItemType():ItemType                              { return this.item_type; }
    getTransactionType():TransactionType                { return this.transaction_type; }
    getAmount():number                                  { return this.amount; }
    getAmountUnit():MoneyUnit                           { return this.amount_unit; }

    setTransactionId(val:number):void                   { this.transaction_id = val; }
    setItemId(val:number):void                          { this.item_id = val; }
    setItemType(val:ItemType):void                      { this.item_type = val; }
    setTransactionType(val:TransactionType):void        { this.transaction_type = val; }
    setAmount(val:number):void                          { this.amount = val; }
    setAmountUnit(val:MoneyUnit):void                   { this.amount_unit = val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getTransactionId())
                    && !Utils.isNullOrEmpty(this.getItemType());
    }
}
export = TransactionLine