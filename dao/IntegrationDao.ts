import q                        = require('q');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import BaseDAO                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import Integration              = require('../models/Integration');

/**
 * DAO class for third party integrations
 */
class IntegrationDao extends BaseDAO {

    static getAll():q.makePromise
    {
        return MysqlDelegate.executeQuery('SELECT * FROM integration', null);
    }

    static getModel():typeof BaseModel { return Integration; }

}
export = IntegrationDao