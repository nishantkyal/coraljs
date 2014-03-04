import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import UserPhone                = require('../models/UserPhone');

class UserPhoneDao extends BaseDao
{
    getModel():typeof BaseModel { return UserPhone; }
}
export = UserPhoneDao