import BaseDao              = require('./BaseDAO');
import BaseModel            = require('../models/BaseModel');
import IntegrationMember    = require('../models/IntegrationMember');

class IntegrationMemberDao extends BaseDao
{
    getModel():typeof BaseModel { return IntegrationMember; }
}
export = IntegrationMemberDao