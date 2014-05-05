///<reference path='../../_references.d.ts'/>
import AbstractSessionData                              = require('../AbstractSessionData');
import IntegrationMember                                = require('../../models/IntegrationMember');

class SessionData extends AbstractSessionData
{
    private static EXPERT:string            = 'expert';

    /* Getters */
    getIdentifier():string              { return 'CallScheduling'; }
    getExpert():IntegrationMember       { return new IntegrationMember(this.getData()[SessionData.EXPERT]); }

    /* Setters */
    setExpert(val:IntegrationMember)    { this.set(SessionData.EXPERT, val.toJson()); }

}
export = SessionData