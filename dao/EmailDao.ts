import IDao                 = require('./IDao');
import BaseDao              = require('./BaseDAO');
import MysqlDelegate        = require('../delegates/MysqlDelegate')

/**
 * DAO class for Email queue
 */
class EmailDao extends BaseDao {

    static getTableName():string { return 'email'; }

}
export = EmailDao