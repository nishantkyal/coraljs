///<reference path='../../_references.d.ts'/>
import _                                                    = require('underscore');
import AbstractSessionData                                  = require('../AbstractSessionData');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import User                                                 = require('../../models/User');

class SessionData extends AbstractSessionData
{
    private static MEMBERS:string               = 'members';
    private static INTEGRATION_ID:string        = 'integrationId';

    /* Getters */
    getIdentifier():string                      { return 'Dashboard'; }
    getMembers():IntegrationMember[]            { return _.map(this.getData()[SessionData.MEMBERS] || [], function(member) { return new IntegrationMember(member); }); }
    getIntegrationId():number                   { return parseInt(this.getData()[SessionData.INTEGRATION_ID]); }

    /* Setters */
    setMembers(val:IntegrationMember[])         { this.set(SessionData.MEMBERS, _.map(val, function(member) { return member.toJson(); })); }
    setIntegrationId(val:number)                { this.set(SessionData.INTEGRATION_ID, val); }
}
export = SessionData