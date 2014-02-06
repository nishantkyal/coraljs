import BaseDao                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import User                     = require('../models/User');

class UserDao extends BaseDao
{
    getModel():typeof BaseModel { return User; }
}
export = User