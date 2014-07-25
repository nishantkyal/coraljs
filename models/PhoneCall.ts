import BaseModel                                        = require('./BaseModel');
import Utils                                            = require('../common/Utils');
import User                                             = require('../models/User');
import IntegrationMember                                = require('../models/IntegrationMember');
import UserPhone                                        = require('../models/UserPhone');
import TransactionLine                                  = require('../models/TransactionLine');
import MoneyUnit                                        = require('../enums/MoneyUnit');

/**
 Bean class for Phone call
 **/
class PhoneCall extends BaseModel
{
    static TABLE_NAME:string                            = 'phone_call';

    static COL_CALLER_USER_ID:string                        = 'caller_user_id';
    static COL_EXPERT_USER_ID:string                        = 'expert_user_id';
    static COL_CALLER_PHONE_ID:string                       = 'caller_phone_id';
    static COL_EXPERT_PHONE_ID:string                       = 'expert_phone_id';
    static COL_START_TIME:string                            = 'start_time';
    static COL_DURATION:string                              = 'duration';
    static COL_STATUS:string                                = 'status';
    static COL_AGENDA:string                                = 'agenda';
    static COL_RECORDED:string                              = 'recorded';
    static COL_EXTENSION:string                             = 'extension';
    static COL_NUM_RESCHEDULES:string                       = 'num_reschedules';
    static COL_NUM_REATTEMPTS:string                        = 'num_reattempts';
    static COL_DELAY:string                                 = 'delay';
    static COL_CHARGING_RATE:string                         = 'charging_rate';
    static COL_UNIT:string                                  = 'unit';
    static COL_PULSE_RATE:string                            = 'pulse_rate';
    static COL_MIN_DURATION:string                          = 'min_duration';

    static PUBLIC_FIELDS:string[] = [PhoneCall.COL_ID, PhoneCall.COL_CALLER_USER_ID, PhoneCall.COL_CALLER_PHONE_ID, PhoneCall.COL_EXPERT_PHONE_ID,
                                      PhoneCall.COL_START_TIME, PhoneCall.COL_DURATION, PhoneCall.COL_STATUS, PhoneCall.COL_AGENDA, PhoneCall.COL_EXPERT_USER_ID];
    private caller_user_id:number;
    private expert_user_id:number;
    private caller_phone_id:number;
    private expert_phone_id:number;
    private start_time:number;
    private duration:number;
    private status:number;
    private agenda:string;
    private recorded:boolean;
    private extension:string;
    private num_reschedules:number;
    private num_reattempts:number;
    private delay:number;
    private charging_rate:number;
    private unit:MoneyUnit;
    private pulse_rate:number;                                  // Sizes of chargeable time chunks
    private min_duration:number;                                // Min duration for the call

    /* Getters */
    getCallerUserId():number                            { return this.caller_user_id; }
    getExpertUserId():number                            { return this.expert_user_id; }
    getCallerPhoneId():number                           { return this.caller_phone_id; }
    getExpertPhoneId():number                           { return this.expert_phone_id; }
    getStartTime():number                               { return this.start_time; }
    getDuration():number                                { return this.duration; }
    getDelay():number                                   { return this.delay; }
    getStatus():number                                  { return this.status; }
    getAgenda():string                                  { return this.agenda; }
    getRecorded():boolean                               { return this.recorded; }
    getExtension():string                               { return this.extension; }
    getNumReschedules():number                          { return this.num_reschedules; }
    getNumReattempts():number                           { return this.num_reattempts; }
    getChargingRate():number                            { return this.charging_rate; }
    getUnit():MoneyUnit                                 { return this.unit; }
    getPulseRate():number                               { return this.pulse_rate; }
    getMinDuration():number                             { return this.min_duration; }

    getUser():User                                      { return null; }
    getExpertUser():User                                { return null; }
    getUserPhone():UserPhone                            { return null; }
    getExpertPhone():UserPhone                          { return null; }

    /* Setters */
    setCallerUserId(val:number):void                    { this.caller_user_id = val; }
    setExpertUserId(val:number):void                    { this.expert_user_id = val; }
    setCallerPhoneId(val:number):void                   { this.caller_phone_id = val; }
    setExpertPhoneId(val:number):void                   { this.expert_phone_id = val; }
    setStartTime(val:number):void                       { this.start_time = val; }
    setDuration(val:number):void                        { this.duration = val; }
    setDelay(val:number):void                           { this.delay = val; }
    setStatus(val:number):void                          { this.status = val; }
    setAgenda(val:string):void                          { this.agenda = val; }
    setRecorded(val:boolean):void                       { this.recorded = val; }
    setExtension(val:string):void                       { this.extension = val; }
    setNumReschedules(val:number):void                  { this.num_reschedules = val; }
    setNumReattempts(val:number):void                   { this.num_reattempts = val; }
    setChargingRate(val:number)                         { this.charging_rate = val; }
    setUnit(val:MoneyUnit)                              { this.unit = val; }
    setPulseRate(val:number)                            { this.pulse_rate = val; }
    setMinDuration(val:number)                          { this.min_duration = val; }

    setUser(val:User):void                              { }
    setExpertUser(val:User):void                        { }
    setUserPhone(val:UserPhone):void                    { }
    setExpertPhone(val:UserPhone):void                  { }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getExpertUserId())
                    && !Utils.isNullOrEmpty(this.getDuration())
                        && !Utils.isNullOrEmpty(this.getCallerPhoneId())
                            && !Utils.isNullOrEmpty(this.getCallerUserId());
    }
}
export = PhoneCall