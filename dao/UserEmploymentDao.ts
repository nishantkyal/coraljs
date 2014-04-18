import AbstractDao                          = require('./AbstractDao');
import BaseModel                            = require('../models/BaseModel');
import UserEmployment                       = require('../models/UserEmployment');

class UserEmploymentDao extends AbstractDao
{
    constructor() { super(UserEmployment); }
}
export = UserEmploymentDao