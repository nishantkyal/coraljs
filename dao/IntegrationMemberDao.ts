import BaseDao              = require('./BaseDao');
import BaseModel            = require('../models/BaseModel');
import IntegrationMember    = require('../models/IntegrationMember');

class IntegrationMemberDao extends BaseDao
{
    constructor() { super(IntegrationMember); }
}
export = IntegrationMemberDao