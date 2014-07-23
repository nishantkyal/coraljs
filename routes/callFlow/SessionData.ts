///<reference path='../../_references.d.ts'/>
import moment                                           = require('moment');
import _                                                = require('underscore');
import AbstractSessionData                              = require('../AbstractSessionData');
import PhoneCall                                        = require('../../models/PhoneCall');
import Integration                                      = require('../../models/Integration');
import User                                             = require('../../models/User');
import Transaction                                      = require('../../models/Transaction');
import ExpertSchedule                                   = require('../../models/Schedule');
import Utils                                            = require('../../common/Utils');

class SessionData extends AbstractSessionData
{
    static IDENTIFIER:string                            = 'CallFlow';
    private static CALL:string                          = 'phoneCall';
    private static INTEGRATION:string                   = 'integration';
    private static USER:string                          = 'user';
    private static IS_AVAILABLE:string                  = 'is_available';
    private static NEXT_AVAILABLE_SCHEDULE:string       = 'next_available_schedule';
    private static APPOINTMENTS:string                  = 'appointments';
    private static CALL_NOW:string                      = 'call_now';
    private static DURATION:string                      = 'duration';
    private static TRANSACTION:string                   = 'transaction';
    private static AREA_CODE:string                     = 'area_code';
    private static COUNTRY_CODE:string                  = 'country_code';
    private static CALLER_PHONE:string                  = 'caller_phone';
    private static AGENDA:string                        = 'agenda';
    private static EXPERT_GMT_OFFSET                    = 'expertGmtOffset';
    private static USER_GMT_OFFSET                      = 'userGmtOffset';

    constructor(req)
    {
        super(req);
        this.computeAvailability();
    }

    /* Getters */
    getIdentifier():string                              { return SessionData.IDENTIFIER; }
    getCall():PhoneCall                                 { return new PhoneCall(this.getData()[SessionData.CALL]); }
    getIntegration():Integration                        { return new Integration(this.getData()[SessionData.INTEGRATION]); }
    getUser():User                                      { return new User(this.getData()[SessionData.USER]); }
    getNextAvailableSchedule():ExpertSchedule           { return new ExpertSchedule(this.getData()[SessionData.NEXT_AVAILABLE_SCHEDULE]); }
    getAppointments():number[]                          { return this.getData()[SessionData.APPOINTMENTS]; }
    getCallNow():boolean                                { return this.getData()[SessionData.CALL_NOW]; }
    getDuration():number                                { return parseInt(this.getData()[SessionData.DURATION]); }
    getTransaction():Transaction                        { return this.getData()[SessionData.TRANSACTION] ? new Transaction(this.getData()[SessionData.TRANSACTION]) : null; }
    getAreaCode():string                                { return this.getData()[SessionData.AREA_CODE]; }
    getCountryCode():number                             { return parseInt(this.getData()[SessionData.COUNTRY_CODE]); }
    getCallerPhone():string                             { return this.getData()[SessionData.CALLER_PHONE]; }
    getAgenda():string                                  { return this.getData()[SessionData.AGENDA]; }
    getExpertGmtOffset():number                         { return this.getData()[SessionData.EXPERT_GMT_OFFSET]}
    getUserGmtOffset():number                           { return this.getData()[SessionData.USER_GMT_OFFSET]}

    /* Setters */
    setCall(val:PhoneCall)                              { this.set(SessionData.CALL, val && val.toJson ? val.toJson() : val); }
    setIntegration(val:Integration)                     { this.set(SessionData.INTEGRATION, val.toJson()); }
    setUser(val:User)                                   { this.set(SessionData.USER, val.toJson());  this.computeAvailability(); }
    setAppointments(val:number[])                       { this.set(SessionData.APPOINTMENTS, val); }
    setCallNow(val:boolean)                             { this.set(SessionData.CALL_NOW, val); }
    setDuration(val:number)                             { this.set(SessionData.DURATION, val); }
    setTransaction(val:Transaction)                     { this.set(SessionData.TRANSACTION, val && val.toJson ? val.toJson() : val); }
    setAreaCode(val:number)                             { this.set(SessionData.AREA_CODE, val); }
    setCountryCode(val:number)                          { this.set(SessionData.COUNTRY_CODE, val); }
    setCallerPhone(val:string)                          { this.set(SessionData.CALLER_PHONE, val); }
    setAgenda(val:string)                               { this.set(SessionData.AGENDA, val); }
    setExpertGmtOffset(val:number)                      { this.set(SessionData.EXPERT_GMT_OFFSET, val); }
    setUserGmtOffset(val:number)                        { this.set(SessionData.USER_GMT_OFFSET, val); }

    computeAvailability()
    {
        if (this.getUser() && this.getUser().isValid() && this.getUser().getSchedule())
        {
            var nextAvailableSchedule:ExpertSchedule = _.find(this.getUser().getSchedule(), function (schedule):boolean
            {
                var scheduleEndTime = schedule[ExpertSchedule.START_TIME] + schedule[ExpertSchedule.DURATION];
                return scheduleEndTime > moment().add({minutes: 15}).valueOf();
            });

            if (!Utils.isNullOrEmpty(nextAvailableSchedule))
            {
                this.set(SessionData.NEXT_AVAILABLE_SCHEDULE, nextAvailableSchedule);
                var currentTime = moment().valueOf();
                this.set(SessionData.IS_AVAILABLE, currentTime > nextAvailableSchedule[ExpertSchedule.START_TIME] && currentTime < (nextAvailableSchedule[ExpertSchedule.START_TIME] + nextAvailableSchedule[ExpertSchedule.DURATION]));
            }
        }
    }
}
export = SessionData
