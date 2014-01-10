import BaseDAO              = require('./BaseDAO');
import BaseModel            = require('../models/BaseModel');
import IntegrationMember    = require('../models/IntegrationMember');

class IntegrationMemberDao extends BaseDAO {

    static getTableName():string { return 'integration_member'; }
    static getGeneratedIdName():string { return 'integration_member_id'; }
    getModel():typeof BaseModel { return IntegrationMember; }

}
export = IntegrationMemberDao