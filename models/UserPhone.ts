import BaseModel                                        = require('./BaseModel');
import PhoneType                                        = require('../enums/PhoneType');
import CountryCode                                      = require('../enums/CountryCode');
import Utils                                            = require('../common/Utils');

class UserPhone extends BaseModel
{
    static TABLE_NAME:string = 'user_phone';

    static COL_USER_ID:string = 'user_id';
    static COL_COUNTRY_CODE:string = 'country_code';
    static COL_AREA_CODE:string = 'area_code';
    static COL_PHONE:string = 'phone';
    static COL_TYPE:string = 'type';
    static COL_VERIFIED:string = 'verified';

    static PUBLIC_FIELDS:string[] = [UserPhone.COL_ID, UserPhone.COL_USER_ID, UserPhone.COL_COUNTRY_CODE, UserPhone.COL_AREA_CODE, UserPhone.COL_PHONE, UserPhone.COL_TYPE, UserPhone.COL_VERIFIED];

    private user_id:number;
    private country_code:CountryCode;
    private area_code:string;
    private phone:string;
    private type:PhoneType;
    private verified:boolean;

    /* Getters */
    getUserId():number                                  { return this.user_id; }
    getCountryCode():CountryCode                        { return this.country_code; }
    getAreaCode():string                                { return this.area_code; }
    getPhone():string                                   { return this.phone; }
    getType():PhoneType                                 { return this.type; }
    getVerified():boolean                               { return this.verified; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getUserId())
                && !Utils.isNullOrEmpty(this.getPhone())
                    && (this.getType() == PhoneType.MOBILE || Utils.isNullOrEmpty(this.getAreaCode()));
    }

    getCompleteNumber():string
    {
        if (this.getType() == PhoneType.LANDLINE)
            return '+' + this.getCountryCode() + '-' + this.getAreaCode() + '-' + this.getPhone();
        else
            return '+' + this.getCountryCode() + '-' + this.getPhone();
    }

    /* Getters */
    setUserId(val:number):void                          { this.user_id = val; }
    setCountryCode(val:CountryCode):void                { this.country_code = val; }
    setAreaCode(val:string):void                        { this.area_code = val; }
    setPhone(val:string):void                           { this.phone = val; }
    setType(val:PhoneType):void                         { this.type = val; }
    setVerified(val:boolean):void                       { this.verified = val; }

}
export = UserPhone
