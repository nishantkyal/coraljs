///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import BaseModel                                = require('./BaseModel');
import Priority                                 = require('../enums/Priority');
import PhoneNumber                              = require('../models/PhoneNumber');
import Utils                                    = require('../common/Utils');

class SMS extends BaseModel
{
    static TABLE_NAME:string = 'sms';

    static COUNTRY_CODE:string = 'country_code';
    static PHONE:string = 'phone';
    static SENDER:string = 'sender';
    static MESSAGE:string = 'message';
    static SCHEDULED_DATE:string = 'scheduled_date';
    static STATUS:string = 'status';
    static NUM_RETRIES:string = 'num_retries';
    static PRIORITY:string = 'priority';

    private phone:PhoneNumber;
    private sender:string;
    private message:string;
    private scheduled_date:number;
    private status:number;
    private num_retries:number;
    private priority:Priority;

    /* Getters */
    getPhone():PhoneNumber { return this.phone; }
    getSender():string { return this.sender; }
    getMessage():string { return this.message; }
    getScheduledDate():number { return this.scheduled_date; }
    getStatus():number { return this.status; }
    getNumRetries():number { return this.num_retries; }
    getPriority():Priority { return this.priority; }

    /* Setters */
    setPhone(val:PhoneNumber):void { this.phone = val; }
    setSender(val:string):void { this.sender = val; }
    setMessage(val:string):void { this.message = val; }
    setScheduledDate(val:number):void { this.scheduled_date = val; }
    setStatus(val:number):void { this.status = val; }
    setNumRetries(val:number):void { this.num_retries = val; }
    setPriority(val:Priority):void { this.priority = val; }

    isValid():boolean {
        return !Utils.isNullOrEmpty(this.getPhone())
                    && this.getPhone().isValid()
                        && !Utils.isNullOrEmpty(this.getMessage());
    }
}
export = SMS