import BaseDAO          = require('../dao/BaseDAO')

/**
 DAO for User
 No business logic goes here, only data access layer
 **/
class UserDao extends BaseDAO
{

    static getTableName():string { return 'user'; }
    static getGeneratedIdName():string { return 'user_id'; }

}
export = UserDao