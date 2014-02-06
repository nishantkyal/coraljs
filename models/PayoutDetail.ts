import BaseModel                = require('./BaseModel');

/**
 * Bean class for payout details for User
 * e.g. Bank accounts, paypal ids
 */
class PayoutDetail extends BaseModel
{
    static TABLE_NAME:string = 'payout_detail';

    private user_id:number;
    private mode:number;
    private account_holder_name:string;
    private account_num:string;
    private ifsc_code:string;
    private bank_name:string;

    /** Getters **/
    getUserId():number { return this.user_id; }
    getMode():number { return this.mode; }
    getAccountHolderName():string { return this.account_holder_name; }
    getAccountNum():string { return this.account_num; }
    getIfscCode():string { return this.ifsc_code; }
    getBankName():string { return this.bank_name; }

    /** Setters **/
    setUserId(val:number) { this.user_id = val; }
    setMode(val:number) { this.mode = val; }
    setAccountHolderName(val:string) { this.account_holder_name = val; }
    setAccountNum(val:string) { this.account_num = val; }
    setIfscCode(val:string) { this.ifsc_code = val; }
    setBankName(val:string) { this.bank_name = val; }
}
export = PayoutDetail