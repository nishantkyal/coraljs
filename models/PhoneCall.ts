import BaseModel                                    = require('./BaseModel');
import Utils                                        = require('../common/Utils');
import User                                         = require('../models/User');
import IntegrationMember                            = require('../models/IntegrationMember');
import UserPhone                                    = require('../models/UserPhone');

/**
 Bean class for Phone call
 **/
class PhoneCall extends BaseModel
{
    static TABLE_NAME:string = 'call';

    static CALLER_USER_ID:string = 'caller_user_id';
    static INTEGRATION_MEMBER_ID:string = 'integration_member_id';
    static CALLER_PHONE_ID:string = 'caller_phone_id';
    static EXPERT_PHONE_ID:string = 'expert_phone_id';
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
    static NUM_REATTEMPTS:string = 'num_reattempts';
    static DELAY:string = 'delay';

    static DEFAULT_FIELDS:string[] = [PhoneCall.ID, PhoneCall.CALLER_USER_ID, PhoneCall.INTEGRATION_MEMBER_ID, PhoneCall.CALLER_PHONE_ID, PhoneCall.EXPERT_PHONE_ID,
                                      PhoneCall.START_TIME, PhoneCall.DURATION, PhoneCall.STATUS ];

    static CALLER:string = 'caller';
    static INTEGRATION_MEMBER:string = 'integration_member';
    static CALLER_PHONE:string = 'caller_phone';
    static EXPERT_PHONE:string = 'expert_phone';

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
    private num_reattempts:number;
    private delay:number;

    private caller:User;
    private integration_member:IntegrationMember;
    private caller_phone:UserPhone;
    private expert_phone:UserPhone;

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
    getNumReattempts():number { return this.num_reattempts; }
    getDelay():number { return this.delay; }

    getCaller():User { return this.caller; }
    getIntegrationMember():IntegrationMember { return this.integration_member; }
    getCallerPhone():UserPhone { return this.caller_phone; }
    getExpertPhone():UserPhone { return this.expert_phone; }

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
    setNumReattempts(val:number):void {this.num_reattempts = val; }
    setDelay(val:number):void {this.delay = val; }

    setCaller(val:User):void { this.caller = val; }
    setIntegrationMember(val:IntegrationMember):void { this.integration_member = val; }
    setCallerPhone(val:UserPhone):void { this.caller_phone = val; }
    setExpertPhone(val:UserPhone):void { this.expert_phone = val; }

    isValid():boolean
    {
        // !Utils.isNullOrEmpty(this.getCallerId())
        // && !Utils.isNullOrEmpty(this.getAgenda())

        return (!Utils.isNullOrEmpty(this.getIntegrationMemberId())
                    && !Utils.isNullOrEmpty(this.getDuration()));
    }
}
export = PhoneCall