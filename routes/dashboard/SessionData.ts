///<reference path='../../_references.d.ts'/>
import _                                                    = require('underscore');
import AbstractSessionData                                  = require('../AbstractSessionData');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import User                                                 = require('../../models/User');
import Integration                                          = require('../../models/Integration');

class SessionData extends AbstractSessionData
{
    private static MEMBERS:string               = 'members';
    private static INTEGRATION:string           = 'integration';

    /* Getters */
    getIdentifier():string                      { return 'Dashboard'; }
    getMembers():IntegrationMember[]            { return _.map(this.getData()[SessionData.MEMBERS] || [], function(member) { return new IntegrationMember(member); }); }
    getIntegration():Integration                { return new Integration(this.getData()[SessionData.INTEGRATION]); }

    /* Setters */
    setMembers(val:IntegrationMember[])         { this.set(SessionData.MEMBERS, _.map(val, function(member) { return member.toJson(); })); }
    setIntegration(val:Integration)             { this.set(SessionData.INTEGRATION, val ? val.toJson() : val); }
}
export = SessionData