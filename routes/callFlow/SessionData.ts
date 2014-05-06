///<reference path='../../_references.d.ts'/>
import moment                                           = require('moment');
import _                                                = require('underscore');
import AbstractSessionData                              = require('../AbstractSessionData');
import PhoneCall                                        = require('../../models/PhoneCall');
import Integration                                      = require('../../models/Integration');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Transaction                                      = require('../../models/Transaction');
import ExpertSchedule                                   = require('../../models/ExpertSchedule');
import Utils                                            = require('../../common/Utils');

class SessionData extends AbstractSessionData
{
    private static INTEGRATION:string                   = 'integration';
    private static EXPERT:string                        = 'expert';
    private static IS_AVAILABLE:string                  = 'is_available';
    private static NEXT_AVAILABLE_SCHEDULE:string       = 'next_available_schedule';
    private static APPOINTMENTS:string                  = 'appointments';
    private static CALL_NOW:string                      = 'call_now';
    private static DURATION:string                      = 'duration';
    private static CALLER_NAME:string                   = 'caller_name';
    private static CALLER_PHONE:string                  = 'caller_phone';
    private static AGENDA:string                        = 'agenda';

    constructor(req)
    {
        super(req);
        this.computeAvailability();
    }

    /* Getters */
    getIdentifier():string                              { return 'CallFlow'; }
    getIntegration():Integration                        { return new Integration(this.getData()[SessionData.INTEGRATION]); }
    getExpert():IntegrationMember                       { return new IntegrationMember(this.getData()[SessionData.EXPERT]); }
    getNextAvailableSchedule():ExpertSchedule           { return new ExpertSchedule(this.getData()[SessionData.NEXT_AVAILABLE_SCHEDULE]); }
    getAppointments():number[]                          { return this.getData()[SessionData.APPOINTMENTS]; }
    getCallNow():boolean                                { return this.getData()[SessionData.CALL_NOW]; }
    getDuration():number                                { return parseInt(this.getData()[SessionData.DURATION]); }
    getCallerName():string                              { return this.getData()[SessionData.CALLER_NAME]; }
    getCallerPhone():string                             { return this.getData()[SessionData.CALLER_PHONE]; }
    getAgenda():string                                  { return this.getData()[SessionData.AGENDA]; }

    /* Setters */

    setIntegration(val:Integration)                     { this.set(SessionData.INTEGRATION, val.toJson()); }
    setExpert(val:IntegrationMember)                    { this.set(SessionData.EXPERT, val.toJson());  this.computeAvailability(); }
    setAppointments(val:number[])                       { this.set(SessionData.APPOINTMENTS, val); }
    setCallNow(val:boolean)                             { this.set(SessionData.CALL_NOW, val); }
    setDuration(val:number)                             { this.set(SessionData.DURATION, val); }
    setCallerName(val:string)                           { this.set(SessionData.CALLER_NAME, val); }
    setCallerPhone(val:string)                          { this.set(SessionData.CALLER_PHONE, val); }
    setAgenda(val:string)                               { this.set(SessionData.AGENDA, val); }

    private computeAvailability()
    {
        if (this.getExpert() && this.getExpert().isValid() && this.getExpert().getSchedule())
        {
            var nextAvailableSchedule:ExpertSchedule = _.find(this.getExpert().getSchedule(), function (schedule):boolean
            {
                var scheduleEndTime = schedule[ExpertSchedule.START_TIME] + schedule[ExpertSchedule.DURATION];
                return scheduleEndTime > moment().add({minutes: 15}).valueOf();
            });

            if (!Utils.isNullOrEmpty(nextAvailableSchedule))
            {
                this.set(SessionData.NEXT_AVAILABLE_SCHEDULE, nextAvailableSchedule);
                var currentTime = moment().valueOf();
                this.set(SessionData.IS_AVAILABLE, currentTime > nextAvailableSchedule[ExpertSchedule.START_TIME] && currentTime < (nextAvailableSchedule[ExpertSchedule.START_TIME] + nextAvailableSchedule[ExpertSchedule.DURATION]))
            }
        }
    }
}
export = SessionData
