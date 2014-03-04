import BaseModel            = require('./BaseModel');
import Utils                = require('../common/Utils');

/**
 Bean class for Phone call
 **/
class PhoneCall extends BaseModel
{
    static TABLE_NAME:string = 'call';

    private caller_user_id:number;
    private integration_member_id:number;
    private caller_phone_id:number;
    private expert_phone_id:number;
    private start_time:number;
    private duration:number;
    private status:number;
    private price:number;
    private price_currency:number;
    private cost:number;
    private cost_currency:number;
    private agenda:string;
    private recorded:boolean;
    private extension:string;
    private num_reschedules:number;

    /* Getters */
    getCallerUserId():number { return this.caller_user_id; }
    getIntegrationMemberId():number { return this.integration_member_id; }
    getCallerPhoneId():number { return this.caller_phone_id; }
    getExpertPhoneId():number { return this.expert_phone_id; }
    getStartTime():number { return this.start_time; }
    getDuration():number { return this.duration; }
    getStatus():number { return this.status; }
    getPrice():number { return this.price; }
    getPriceCurrency():number { return this.price_currency; }
    getCost():number { return this.cost; }
    getCostCurrency():number { return this.cost_currency; }
    getAgenda():string { return this.agenda; }
    getRecorded():boolean{ return this.recorded; }
    getExtension():string { return this.extension; }
    getNumReschedules():number { return this.num_reschedules; }

    /* Setters */
    setCallerUserId(val:number):void { this.caller_user_id = val; }
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setCallerPhoneId(val:number):void { this.caller_phone_id = val; }
    setExpertPhoneId(val:number):void { this.expert_phone_id = val; }
    setStartTime(val:number):void { this.start_time = val; }
    setDuration(val:number):void { this.duration = val; }
    setStatus(val:number):void { this.status = val; }
    setPrice(val:number):void { this.price = val; }
    setPriceCurrency(val:number):void { this.price_currency = val; }
    setCost(val:number):void { this.cost = val; }
    setCostCurrency(val:number):void { this.cost_currency = val; }
    setAgenda(val:string):void { this.agenda = val; }
    setRecorded(val:boolean):void { this.recorded = val; }
    setExtension(val:string):void { this.extension = val; }
    setNumReschedules(val:number):void { this.num_reschedules = val; }

    isValid():boolean
    {
        // !Utils.isNullOrEmpty(this.getCallerId())
        // && !Utils.isNullOrEmpty(this.getAgenda())

        return (!Utils.isNullOrEmpty(this.getIntegrationMemberId())
                    && !Utils.isNullOrEmpty(this.getDuration()));
    }
}
export = PhoneCall