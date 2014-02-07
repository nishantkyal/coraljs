import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import User                     = require('../models/User');

class UserDao extends BaseDao
{
    getModel():typeof BaseModel { return User; }
}
export = UserDao