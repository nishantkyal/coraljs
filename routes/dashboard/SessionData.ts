///<reference path='../../_references.d.ts'/>
import _                                                    = require('underscore');
import AbstractSessionData                                  = require('../AbstractSessionData');
import IntegrationMember                                    = require('../../models/IntegrationMember');
import User                                                 = require('../../models/User');
import Integration                                          = require('../../models/Integration');

class SessionData extends AbstractSessionData
{
    private static INTEGRATION:string           = 'integration';

    /* Getters */
    getIdentifier():string                      { return 'Dashboard'; }
    getIntegration():Integration                { return new Integration(this.getData()[SessionData.INTEGRATION]); }

    /* Setters */
    setIntegration(val:Integration)             { this.set(SessionData.INTEGRATION, val ? val.toJson() : val); }
}
export = SessionData