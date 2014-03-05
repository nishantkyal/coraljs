import BaseModel            = require('./BaseModel');
import Utils                = require('../common/Utils');
import MoneyUnit            = require('../enums/MoneyUnit');

/*
 Bean class for Phone call
 */
class PhoneCall extends BaseModel
{
    static TABLE_NAME:string = 'phone_call';

    static CALLER_ID:string = 'caller_id';
    static EXPERT_ID:string = 'expert_id';
    static INTEGRATION_ID:string = 'integration_id';
    static SCHEDULE_ID:string = 'schedule_id';
    static START_TIME:string = 'start_time';
    static DURATION:string = 'duration';
    static STATUS:string = 'status';
    static PRICE:string = 'price';
    static PRICE_CURRENCY:string = 'price_currency';
    static COST:string = 'cost';
    static COST_CURRENCY:string = 'cost_currency';
    static AGENDA:string = 'agenda';
    static RECORDED:string = 'recorded';
    static EXTENSION:string = 'extension';
    static NUM_RESCHEDULES:string = 'num_reschedules';

    private caller_id:number;
    private expert_id:number;
    private integration_id:number;
    private schedule_id:number;
    private start_time:number;
    private duration:number;
    private status:number;
    private price:number;
    private price_currency:MoneyUnit;
    private cost:number;
    private cost_currency:MoneyUnit;
    private agenda:string;
    private recorded:boolean;
    private extension:string;
    private num_reschedules:number;

    /* Getters */
    getCallerId():number { return this.caller_id; }
    getExpertId():number { return this.expert_id; }
    getIntegrationId():number { return this.integration_id; }
    getScheduleId():number { return this.schedule_id; }
    getStartTime():number { return this.start_time; }
    getDuration():number { return this.duration; }
    getStatus():number { return this.status; }
    getPrice():number { return this.price; }
    getPriceCurrency():MoneyUnit { return this.price_currency; }
    getCost():number { return this.cost; }
    getCostCurrency():MoneyUnit { return this.cost_currency; }
    getAgenda():string { return this.agenda; }
    getRecorded():boolean{ return this.recorded; }
    getExtension():string { return this.extension; }
    getNumReschedules():number { return this.num_reschedules; }

    /* Setters */
    setCallerId(val:number):void { this.caller_id = val; }
    setExpertId(val:number):void { this.expert_id = val; }
    setIntegrationId(val:number):void { this.integration_id = val; }
    setScheduleId(val:number):void { this.schedule_id = val; }
    setStartTime(val:number):void { this.start_time = val; }
    setDuration(val:number):void { this.duration = val; }
    setStatus(val:number):void { this.status = val; }
    setPrice(val:number):void { this.price = val; }
    setPriceCurrency(val:MoneyUnit):void { this.price_currency = val; }
    setCost(val:number):void { this.cost = val; }
    setCostCurrency(val:MoneyUnit):void { this.cost_currency = val; }
    setAgenda(val:string):void { this.agenda = val; }
    setRecorded(val:boolean):void { this.recorded = val; }
    setExtension(val:string):void { this.extension = val; }
    setNumReschedules(val:number):void { this.num_reschedules = val; }

    isValid():boolean
    {
        // !Utils.isNullOrEmpty(this.getCallerId())
        // && !Utils.isNullOrEmpty(this.getAgenda())

        return (!Utils.isNullOrEmpty(this.getExpertId())
                    && !Utils.isNullOrEmpty(this.getDuration())
                        && !Utils.isNullOrEmpty(this.getScheduleId()));
    }
}
export = PhoneCall