///<reference path='../../_references.d.ts'/>
import AbstractSessionData                              = require('../AbstractSessionData');
import PhoneCall                                        = require('../../models/PhoneCall');
import Integration                                      = require('../../models/Integration');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Transaction                                      = require('../../models/Transaction');

class SessionData extends AbstractSessionData
{
    private static CALL_ID:string           = 'callId';
    private static CALL:string              = 'phoneCall';
    private static INTEGRATION:string       = 'integration';
    private static EXPERT:string            = 'expert';
    private static APPOINTMENTS:string      = 'appointments';
    private static DURATION:string          = 'duration';
    private static TRANSACTION:string       = 'transaction';
    private static USER_PHONE_ID:string     = 'user_phone_id';
    private static CALLER_NAME:string       = 'caller_name';
    private static CALLER_PHONE:string      = 'caller_phone';
    private static AGENDA:string            = 'agenda';

    /* Getters */
    getIdentifier():string              { return 'CallFlow'; }
    getCallId():number                  { return parseInt(this.getData()[SessionData.CALL_ID]); }
    getCall():PhoneCall                 { return new PhoneCall(this.getData()[SessionData.CALL]); }
    getIntegration():Integration        { return new Integration(this.getData()[SessionData.INTEGRATION]); }
    getExpert():IntegrationMember       { return new IntegrationMember(this.getData()[SessionData.EXPERT]); }
    getAppointments():number[]          { return this.getData()[SessionData.APPOINTMENTS]; }
    getDuration():number                { return parseInt(this.getData()[SessionData.DURATION]); }
    getTransaction():Transaction        { return new Transaction(this.getData()[SessionData.TRANSACTION]); }
    getUserPhoneId():number             { return parseInt(this.getData()[SessionData.USER_PHONE_ID]); }
    getCallerName():string              { return this.getData()[SessionData.CALLER_NAME]; }
    getCallerPhone():string             { return this.getData()[SessionData.CALLER_PHONE]; }
    getAgenda():string                  { return this.getData()[SessionData.AGENDA]; }

    /* Setters */
    setCallId(val:number)               { this.set(SessionData.CALL_ID, val); }
    setCall(val:PhoneCall)              { this.set(SessionData.CALL, val.toJson()); }
    setIntegration(val:Integration)     { this.set(SessionData.INTEGRATION, val.toJson()); }
    setExpert(val:IntegrationMember)    { this.set(SessionData.EXPERT, val.toJson()); }
    setAppointments(val:number[])       { this.set(SessionData.APPOINTMENTS, val); }
    setDuration(val:number)             { this.set(SessionData.DURATION, val); }
    setTransaction(val:Transaction)     { this.set(SessionData.TRANSACTION, val.toJson()); }
    setUserPhoneId(val:number)          { this.set(SessionData.USER_PHONE_ID, val); }
    setCallerName(val:string)           { this.set(SessionData.CALLER_NAME, val); }
    setCallerPhone(val:string)          { this.set(SessionData.CALLER_PHONE, val); }
    setAgenda(val:string)               { this.set(SessionData.AGENDA, val); }

}
export = SessionData