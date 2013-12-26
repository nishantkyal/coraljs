import BaseDAO              = require('./BaseDAO');
import IntegrationMember    = require('../models/IntegrationMember');

class IntegrationMemberDao extends BaseDAO {

    static getTableName():string { return 'integration_member'; }
    static getGeneratedIdName():string { return 'integration_member_id'; }
    getModel():any { return IntegrationMember; }

}
export = IntegrationMemberDao