import AbstractDao          = require('./AbstractDao');
import BaseModel            = require('../models/BaseModel');
import IntegrationMember    = require('../models/IntegrationMember');

class IntegrationMemberDao extends AbstractDao
{
    constructor() { super(IntegrationMember); }
}
export = IntegrationMemberDao