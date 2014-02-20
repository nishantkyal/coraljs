import BaseModel                = require('./BaseModel');

class PhoneNumber extends BaseModel
{
    static TABLE_NAME:string = 'user_phone';

    static USER_ID:string = 'user_id';
    static COUNTRY_CODE:string = 'country_code';
    static AREA_CODE:string = 'area_code';
    static PHONE:string = 'phone';
    static TYPE:string = 'type';
    static VERIFIED:string = 'verified';

    private user_id:number;
    private country_code:string;
    private area_code:string;
    private phone:number;
    private type:number;
    private verified:boolean;

    /* Getters */
    getUserId():number { return this.user_id; }
    getCountryCode():string { return this.country_code; }
    getAreaCode():string { return this.area_code; }
    getPhone():number { return this.phone; }
    getType():number { return this.type; }
    getVerified():boolean { return this.verified; }

    isValid():boolean
    {
        return this.getUserId() != null && this.getPhone() != null;
    }

    /* Getters */
    setUserId(val:number):void { this.user_id = val; }
    setCountryCode(val:string):void { this.country_code = val; }
    setAreaCode(val:string):void { this.area_code = val; }
    setPhone(val:number):void { this.phone = val; }
    setType(val:number):void { this.type = val; }
    setVerified(val:boolean):void { this.verified = val; }

}
export = PhoneNumber