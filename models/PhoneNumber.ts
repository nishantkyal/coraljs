import BaseModel                                        = require('./BaseModel');
import PhoneNumberType                                  = require('../enums/PhoneNumberType');
import CountryCode                                      = require('../enums/CountryCode');
import Utils                                            = require('../common/Utils');

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
    private country_code:CountryCode;
    private area_code:string;
    private phone:string;
    private type:PhoneNumberType;
    private verified:boolean;

    /* Getters */
    getUserId():number { return this.user_id; }
    getCountryCode():CountryCode { return this.country_code; }
    getAreaCode():string { return this.area_code; }
    getPhone():string { return this.phone; }
    getType():PhoneNumberType { return this.type; }
    getVerified():boolean { return this.verified; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getUserId())
                && !Utils.isNullOrEmpty(this.getPhone())
                    && (this.getType() == PhoneNumberType.MOBILE || Utils.isNullOrEmpty(this.getAreaCode()));
    }

    getCompleteNumber():string
    {
        if (this.getType() == PhoneNumberType.LANDLINE)
            return '+' + this.getCountryCode() + this.getAreaCode() + this.getPhone();
        else
            return '+' + this.getCountryCode() + this.getPhone();
    }

    /* Getters */
    setUserId(val:number):void { this.user_id = val; }
    setCountryCode(val:CountryCode):void { this.country_code = val; }
    setAreaCode(val:string):void { this.area_code = val; }
    setPhone(val:string):void { this.phone = val; }
    setType(val:PhoneNumberType):void { this.type = val; }
    setVerified(val:boolean):void { this.verified = val; }

}
export = PhoneNumber