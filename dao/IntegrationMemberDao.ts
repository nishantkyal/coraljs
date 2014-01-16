import BaseDAO              = require('./BaseDAO');
import BaseModel            = require('../models/BaseModel');
import IntegrationMember    = require('../models/IntegrationMember');

class IntegrationMemberDao extends BaseDAO
{
    getModel():typeof BaseModel { return IntegrationMember; }
}
export = IntegrationMemberDao