import BaseModel                = require('./BaseModel');

class SMS extends BaseModel
{
    private country_code:string;
    private area_code:string;
    private phone:number;
    private sender:string;
    private message:string;
    private scheduled_date:number;
    private status:number;

    /* Getters */
    getCountryCode():string { return this.country_code; }
    getAreaCode():string { return this.area_code; }
    getPhone():number { return this.phone; }
    getSender():string { return this.sender; }
    getMessage():string { return this.message; }
    getScheduledDate():number { return this.scheduled_date; }
    getStatus():number { return this.status; }

    /* Setters */
    setCountryCode(val:string):void { this.country_code = val; }
    setAreaCode(val:string):void { this.area_code = val; }
    setPhone(val:number):void { this.phone = val; }
    setSender(val:string):void { this.sender = val; }
    setMessage(val:string):void { this.message = val; }
    setScheduledDate(val:number):void { this.scheduled_date = val; }
    setStatus(val:number):void { this.status = val; }

}
export = SMS