import BaseModel                = require('./BaseModel');

class PhoneNumber extends BaseModel
{
    static TABLE_NAME:string = 'user_phone';
    static PRIMARY_KEY:string = 'user_phone_id';

    private user_phone_id:string;
    private user_id:number;
    private country_code:string;
    private area_code:string;
    private phone:number;
    private type:number;
    private verified:boolean;
    private verification_code:string;

    /* Getters */
    getUserPhoneId():string { return this.user_phone_id; }
    getUserId():number { return this.user_id; }
    getCountryCode():string { return this.country_code; }
    getAreaCode():string { return this.area_code; }
    getPhone():number { return this.phone; }
    getType():number { return this.type; }
    getVerified():boolean { return this.verified; }
    getVerificationCode():string { return this.verification_code; }

    isValid():boolean
    {
        return this.getUserId() != null && this.getPhone() != null;
    }

    /* Getters */
    setUserPhoneId(val:string):void { this.user_phone_id = val; }
    setUserId(val:number):void { this.user_id = val; }
    setCountryCode(val:string):void { this.country_code = val; }
    setAreaCode(val:string):void { this.area_code = val; }
    setPhone(val:number):void { this.phone = val; }
    setType(val:number):void { this.type = val; }
    setVerified(val:boolean):void { this.verified = val; }
    setVerificationCode(val:string):void { this.verification_code = val; }

}
export = PhoneNumber