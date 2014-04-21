import AbstractSessionData                                      = require('../AbstractSessionData');
import IntegrationMember                                        = require('../../models/IntegrationMember');
import Integration                                              = require('../../models/Integration');

class SessionData extends AbstractSessionData
{
    private static INVITATION_CODE:string = 'invitationCode';
    private static INTEGRATION_ID:string = 'integrationId';
    private static INTEGRATION:string = 'integration';
    private static MEMBER:string = 'member';

    /* Getters */
    getIdentifier():string                                      { return 'ExpertRegistration'; }
    getInvitationCode():string                                  { return this.getData()[SessionData.INVITATION_CODE]; }
    getIntegrationId():number                                   { return this.getData()[SessionData.INTEGRATION_ID]; }
    getIntegration():Integration                                { return new Integration(this.getData()[SessionData.INTEGRATION]); }
    getMember():IntegrationMember                               { return new IntegrationMember(this.getData()[SessionData.MEMBER]); }

    /* Setters */
    setInvitationCode(val:string)                               { this.set(SessionData.INVITATION_CODE, val); }
    setIntegrationId(val:number)                                { this.set(SessionData.INTEGRATION_ID, val); }
    setIntegration(val:Integration)                             { this.set(SessionData.INTEGRATION, val.toJson()); }
    setMember(val:IntegrationMember)                            { this.set(SessionData.MEMBER, val.toJson()); }
}
export = SessionData