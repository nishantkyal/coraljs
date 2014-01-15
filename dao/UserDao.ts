import BaseDAO          = require('../dao/BaseDAO')
import BaseModel        = require('../models/BaseModel');
import User             = require('../models/User');

/**
 DAO for User
 No business logic goes here, only data access layer
 **/
class UserDao extends BaseDAO
{
    getModel():typeof BaseModel { return User; }
}
export = UserDao