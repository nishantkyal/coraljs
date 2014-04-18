import q                                                = require('q');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');
import AbstractDao                                      = require('./AbstractDao');
import BaseModel                                        = require('../models/BaseModel');
import Integration                                      = require('../models/Integration');

/*
 * DAO class for third party integrations
 */
class IntegrationDao extends AbstractDao {

    getAll():q.Promise<any>
    {
        return MysqlDelegate.executeQuery('SELECT * FROM integration', null);
    }

    constructor() { super(Integration); }

}
export = IntegrationDao