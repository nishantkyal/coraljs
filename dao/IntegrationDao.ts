import q                        = require('q');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import BaseDAO                  = require('./BaseDAO');

/**
 * DAO class for third party integrations
 */
class IntegrationDao extends BaseDAO {

    static getAll():q.makePromise
    {
        return MysqlDelegate.executeQuery('SELECT * FROM integration', null);
    }

    static getTableName():string { return 'integration'; }
    static getGeneratedIdName():string { return 'integration_id'; }

}
export = IntegrationDao