import BaseDao              = require('./BaseDao');
import BaseModel            = require('../models/BaseModel');
import UserEmployment       = require('../models/UserEmployment');

class UserEmploymentDao extends BaseDao
{
    getModel():typeof BaseModel { return UserEmployment; }
}
export = UserEmploymentDao