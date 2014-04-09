import BaseDao          = require('./BaseDao');
import BaseModel        = require('../models/BaseModel');
import UserEducation    = require('../models/UserEducation');

class UserEducationDao extends BaseDao
{
    getModel():typeof BaseModel { return UserEducation; }
}
export = UserEducationDao