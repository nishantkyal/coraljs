import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import User                     = require('../models/User');

class UserDao extends BaseDao
{
    constructor() { super(User); }
}
export = UserDao