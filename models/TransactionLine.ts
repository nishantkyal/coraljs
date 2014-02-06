///<reference path='./BaseModel.ts'/>

module models
{
    export class TransactionLine extends BaseModel
    {
        static TABLE_NAME:string = 'transaction_line';

        private transaction_id:number;
        private product_id:number;
        private product_type:number;
        private transaction_type:number;
        private amount:number;
        private amount_unit:number;

        getTransactionId():number { return this.transaction_id; }
        getProductId():number { return this.product_id; }
        getProductType():number { return this.product_type; }
        getTransactionType():number { return this.transaction_type; }
        getAmount():number { return this.amount; }
        getAmountUnit():number { return this.amount_unit; }

        setTransactionId(val:number):void { this.transaction_id = val; }
        setProductId(val:number):void { this.product_id = val; }
        setProductType(val:number):void { this.product_type = val; }
        setTransactionType(val:number):void { this.transaction_type = val; }
        setAmount(val:number):void { this.amount = val; }
        setAmountUnit(val:number):void { this.amount_unit = val; }

    }
}