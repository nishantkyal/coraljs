import AbstractMappingDao                   = require('./AbstractMappingDao');
import BaseModel                            = require('../models/BaseModel');
import UserEmployment                       = require('../models/UserEmployment');

class UserEmploymentDao extends AbstractMappingDao
{
    constructor() { super(UserEmployment); }
}
export = UserEmploymentDao