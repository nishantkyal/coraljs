import BaseModel            = require('./BaseModel');

/**
 Bean class for Phone call
 **/
class PhoneCall extends BaseModel
{
    static TABLE_NAME:string = 'call';

    private caller_id:number;
    private expert_id:number;
    private integration_id:number;
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
    getCallerId():number { return this.caller_id; }
    getExpertId():number { return this.expert_id; }
    getIntegrationId():number { return this.integration_id; }
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
    setCallerId(val:number):void { this.caller_id = val; }
    setExpertId(val:number):void { this.expert_id = val; }
    setIntegrationId(val:number):void { this.integration_id = val; }
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

}
export = PhoneCall