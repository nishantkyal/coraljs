import q                        = require('q');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import BaseDAO                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import Integration              = require('../models/Integration');

/**
 * DAO class for third party integrations
 */
class IntegrationDao extends BaseDAO {

    getAll():q.Promise<any>
    {
        return MysqlDelegate.executeQuery('SELECT * FROM integration', null);
    }

    getModel():typeof BaseModel { return Integration; }

}
export = IntegrationDao