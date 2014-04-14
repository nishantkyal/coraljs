import BaseDao              = require('./BaseDao');
import BaseModel            = require('../models/BaseModel');
import UserEmployment       = require('../models/UserEmployment');

class UserEmploymentDao extends BaseDao
{
    constructor() { super(UserEmployment); }
}
export = UserEmploymentDao