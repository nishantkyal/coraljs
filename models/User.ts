import BaseModel        = require('./BaseModel')
import Utils            = require('../common/Utils');

/**
 Bean class for User
 **/
class User extends BaseModel
{
    static TABLE_NAME:string = 'user';

    private first_name:string;
    private last_name:string;
    private mobile:string;
    private email:string;
    private password:string;
    private verified:boolean;
    private activated:boolean;

    /** Getters **/
    getFirstName():string { return this.first_name; }
    getLastName():string { return this.last_name; }
    getMobile():string { return this.mobile; }
    getEmail():string { return this.email; }
    getPassword():string { return this.password; }
    getVerified():boolean { return this.verified; }
    getActivated():boolean { return this.activated; }
    isValid():boolean {
        return this.getId() != null && this.getId() != undefined;
    }

    /** Setters **/
    setFirstName(val:string) { this.first_name = val; }
    setLastName(val:string) { this.last_name = val; }
    setMobile(val:string) { this.mobile = val; }
    setEmail(val:string) { this.email = val; }
    setPassword(val:string) { this.password = val; }
    setVerified(val:boolean) { this.verified = val; }
    setActivated(val:boolean) { this.activated = val; }

}
export = User