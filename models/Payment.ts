import BaseModel                                        = require('./BaseModel');
import MoneyUnit                                        = require('../enums/MoneyUnit');
import PaymentGateway                                   = require('../enums/PaymentGateway');
class Payment extends BaseModel
{
    static TABLE_NAME:string = 'payment';

    static AMOUNT:string                                = 'amount';
    static AMOUNT_UNIT:string                           = 'amount_unit';
    static GATEWAY_ID:string                            = 'gateway_id';
    static GATEWAY_TRANSACTION_ID:string                = 'gateway_transaction_id';
    static GATEWAY_RESPONSE_CODE:string                 = 'gateway_response_code';

    private amount:number;
    private amount_unit:MoneyUnit;
    private gateway_id:PaymentGateway;
    private gateway_transaction_id:string;
    private gateway_response_code:string;

    /* Getters */
    getAmount():number                                  { return this.amount; }
    getAmountUnit():MoneyUnit                           { return this.amount_unit; }
    getGatewayId():PaymentGateway                       { return this.gateway_id; }
    getGatewayTransactionId():string                    { return this.gateway_transaction_id; }
    getGatewayResponseCode():string                     { return this.gateway_response_code; }

    /* Setters */
    setAmount(val:number):void                          { this.amount = val; }
    setAmountUnit(val:MoneyUnit):void                   { this.amount_unit = val; }
    setGatewayId(val:PaymentGateway):void               { this.gateway_id = val; }
    setGatewayTransactionId(val:string):void            { this.gateway_transaction_id = val; }
    setGatewayResponseCode(val:string):void             { this.gateway_response_code = val; }
}
export = Payment