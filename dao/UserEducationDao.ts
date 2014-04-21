import AbstractDao                              = require('./AbstractDao');
import BaseModel                                = require('../models/BaseModel');
import UserEducation                            = require('../models/UserEducation');

class UserEducationDao extends AbstractDao
{
    constructor() { super(UserEducation); }
}
export = UserEducationDao