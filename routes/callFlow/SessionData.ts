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

    /* Getters */
    getIdentifier():string              { return 'CallFlow'; }
    getCallId():number                  { return parseInt(this.getData()[SessionData.CALL_ID]); }
    getCall():PhoneCall                 { return new PhoneCall(this.getData()[SessionData.CALL]); }
    getIntegration():Integration        { return new Integration(this.getData()[SessionData.INTEGRATION]); }
    getExpert():IntegrationMember       { return new IntegrationMember(this.getData()[SessionData.EXPERT]); }
    getAppointments():number[]          { return this.getData()[SessionData.APPOINTMENTS]; }
    getDuration():number                { return parseInt(this.getData()[SessionData.DURATION]); }
    getTransaction():Transaction        { return new Transaction(this.getData()[SessionData.TRANSACTION]); }

    /* Setters */
    setCallId(val:number)               { this.set(SessionData.CALL_ID, val); }
    setCall(val:PhoneCall)              { this.set(SessionData.CALL, val.toJson()); }
    setIntegration(val:Integration)     { this.set(SessionData.INTEGRATION, val.toJson()); }
    setExpert(val:IntegrationMember)    { this.set(SessionData.EXPERT, val.toJson()); }
    setAppointments(val:number[])       { this.set(SessionData.APPOINTMENTS, val); }
    setDuration(val:number)             { this.set(SessionData.DURATION, val); }
    setTransaction(val:Transaction)     { this.set(SessionData.TRANSACTION, val.toJson()); }

}
export = SessionData